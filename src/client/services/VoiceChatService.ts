import {
  ref,
  set,
  get,
  onValue,
  remove,
  push,
  onDisconnect,
  Unsubscribe
} from 'firebase/database';
import { rtdb } from '../firebase/firebaseConfig';

export interface PeerVoiceState {
  uid: string;
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: number;
}

export interface VoiceChatState {
  isSupported: boolean;
  isInVoice: boolean;      // Whether user's local microphone is actively streaming
  isMuted: boolean;        // Whether local microphone is muted
  isSpeaking: boolean;
  isConnecting: boolean;
  error: string | null;
  peers: Record<string, PeerVoiceState>;
  mutedPeerIds: string[];  // List of opponent IDs muted locally by the user
}

type VoiceStateListener = (state: VoiceChatState) => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export class VoiceChatService {
  private static instance: VoiceChatService | null = null;

  private roomCode: string | null = null;
  private currentUid: string | null = null;
  private currentName: string = 'Player';

  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private peerAudioElements: Map<string, HTMLAudioElement> = new Map();
  private mutedPeerIds: Set<string> = new Set();
  private unsubs: Unsubscribe[] = [];

  private state: VoiceChatState = {
    isSupported: typeof window !== 'undefined' && !!(navigator?.mediaDevices?.getUserMedia),
    isInVoice: false,
    isMuted: false,
    isSpeaking: false,
    isConnecting: false,
    error: null,
    peers: {},
    mutedPeerIds: []
  };

  private listeners: Set<VoiceStateListener> = new Set();

  private constructor() {}

  public static getInstance(): VoiceChatService {
    if (!VoiceChatService.instance) {
      VoiceChatService.instance = new VoiceChatService();
    }
    return VoiceChatService.instance;
  }

  public getState(): VoiceChatState {
    return {
      ...this.state,
      mutedPeerIds: Array.from(this.mutedPeerIds)
    };
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((cb) => {
      try {
        cb(s);
      } catch (err) {
        console.error('[VoiceChatService] Listener callback error:', err);
      }
    });
  }

  /**
   * Set room context and immediately enable Listen-Only mode
   * (Allows user to hear opponents even without turning their own mic on!)
   */
  public initRoom(roomCode: string, uid: string, name: string) {
    if (this.roomCode === roomCode && this.currentUid === uid) {
      return;
    }
    this.leaveVoice();
    this.roomCode = roomCode;
    this.currentUid = uid;
    this.currentName = name;

    // Listen to signaling messages for incoming WebRTC audio
    this.setupSignalingListener();

    // Listen to voice state of all room members and connect in listen mode
    this.listenToRoomVoiceStates(roomCode);
  }

  /**
   * Listen to voiceState of players in the room
   */
  private listenToRoomVoiceStates(roomCode: string) {
    try {
      const voiceStatesRef = ref(rtdb, `rooms/${roomCode}/voiceState`);
      const unsub = onValue(voiceStatesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const peers: Record<string, PeerVoiceState> = {};
        Object.keys(data).forEach((uid) => {
          if (uid !== this.currentUid) {
            peers[uid] = data[uid];
          }
        });
        this.state.peers = peers;
        this.notify();

        // Connect WebRTC to any peers broadcasting voice (even if local mic is OFF!)
        if (this.currentUid) {
          Object.keys(peers).forEach((peerUid) => {
            if (!this.peerConnections.has(peerUid)) {
              // Deterministic offerer: lower UID initiates offer
              const shouldOffer = this.currentUid! < peerUid;
              this.setupPeerConnection(peerUid, shouldOffer);
            }
          });
        }
      });
      this.unsubs.push(unsub);
    } catch (err) {
      console.warn('[VoiceChatService] Error listening to voice states:', err);
    }
  }

  /**
   * Toggle Live Microphone (Request perms + Join if inactive, Mute/Unmute if active)
   */
  public async toggleMic(): Promise<boolean> {
    if (!this.state.isInVoice) {
      return this.joinVoice();
    } else {
      this.toggleMute();
      return !this.state.isMuted;
    }
  }

  /**
   * Join Voice Channel & Broadcast Local Voice
   */
  public async joinVoice(): Promise<boolean> {
    if (!this.state.isSupported) {
      this.state.error = 'Live voice is not supported in this browser.';
      this.notify();
      return false;
    }

    if (!this.roomCode || !this.currentUid) {
      this.state.error = 'No active multiplayer room found.';
      this.notify();
      return false;
    }

    this.state.isConnecting = true;
    this.state.error = null;
    this.notify();

    try {
      // 1. Request microphone permission with noise suppression & echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      this.localStream = stream;
      this.state.isInVoice = true;
      this.state.isMuted = false;
      this.state.isConnecting = false;

      // 2. Setup Audio Analyser for Speaking Level Detection
      this.setupSpeakingDetector(stream);

      // 3. Publish voice presence in RTDB
      await this.publishLocalVoiceState(false, false);

      // 4. Attach local audio track to all existing peer connections
      const tracks = stream.getAudioTracks();
      for (const [peerUid, pc] of this.peerConnections.entries()) {
        tracks.forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Renegotiate offer so peer receives our audio
        try {
          const offer = await pc.createOffer({ offerToReceiveAudio: true });
          await pc.setLocalDescription(offer);
          const sigRef = ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${peerUid}/${this.currentUid}/offer`);
          await set(sigRef, {
            type: offer.type,
            sdp: offer.sdp,
            timestamp: Date.now()
          });
        } catch (e) {
          console.warn('[VoiceChatService] Renegotiation error:', e);
        }
      }

      this.notify();
      return true;
    } catch (err: any) {
      console.warn('[VoiceChatService] getUserMedia error:', err);
      this.state.isInVoice = false;
      this.state.isConnecting = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.state.error = 'Microphone permission denied. Please allow microphone access in your browser.';
      } else {
        this.state.error = 'Could not access microphone: ' + (err.message || 'Unknown error');
      }
      this.notify();
      return false;
    }
  }

  /**
   * Toggle Local Mute / Unmute
   */
  public toggleMute() {
    if (!this.localStream) return;
    const newMuted = !this.state.isMuted;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !newMuted;
    });
    this.state.isMuted = newMuted;
    if (newMuted) {
      this.state.isSpeaking = false;
    }
    this.publishLocalVoiceState(newMuted, false);
    this.notify();
  }

  /**
   * Manually mute/unmute a specific opponent's voice locally
   */
  public toggleMutePeer(peerUid: string): boolean {
    let isMuted: boolean;
    if (this.mutedPeerIds.has(peerUid)) {
      this.mutedPeerIds.delete(peerUid);
      isMuted = false;
    } else {
      this.mutedPeerIds.add(peerUid);
      isMuted = true;
    }

    const audioEl = this.peerAudioElements.get(peerUid);
    if (audioEl) {
      audioEl.muted = isMuted;
    }

    this.state.mutedPeerIds = Array.from(this.mutedPeerIds);
    this.notify();
    return isMuted;
  }

  public isPeerMuted(peerUid: string): boolean {
    return this.mutedPeerIds.has(peerUid);
  }

  /**
   * Publish local voice presence in RTDB
   */
  private async publishLocalVoiceState(isMuted: boolean, isSpeaking: boolean) {
    if (!this.roomCode || !this.currentUid) return;
    try {
      const myVoiceRef = ref(rtdb, `rooms/${this.roomCode}/voiceState/${this.currentUid}`);
      await set(myVoiceRef, {
        uid: this.currentUid,
        name: this.currentName,
        isMuted,
        isSpeaking,
        joinedAt: Date.now()
      });
      // Ensure state is removed on unexpected disconnect
      onDisconnect(myVoiceRef).remove();
    } catch (err) {
      console.warn('[VoiceChatService] Failed to publish voice state:', err);
    }
  }

  /**
   * Setup WebRTC Peer Connection with a specific peer
   */
  private async setupPeerConnection(peerUid: string, isOfferer: boolean) {
    if (this.peerConnections.has(peerUid) || !this.roomCode || !this.currentUid) return;

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set(peerUid, pc);

      // Add local audio tracks if microphone is active
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      // Play remote audio track when received from opponent
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          let audioEl = this.peerAudioElements.get(peerUid);
          if (!audioEl) {
            audioEl = new Audio();
            audioEl.autoplay = true;
            (audioEl as any).playsInline = true;
            this.peerAudioElements.set(peerUid, audioEl);
          }
          audioEl.srcObject = remoteStream;
          audioEl.muted = this.mutedPeerIds.has(peerUid);
          audioEl.play().catch((e) => console.warn('[VoiceChatService] Remote audio autoplay:', e));
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && this.roomCode && this.currentUid) {
          const candRef = push(ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${peerUid}/${this.currentUid}/candidates`));
          set(candRef, event.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          this.closePeer(peerUid);
        }
      };

      // Designate offerer
      if (isOfferer) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true
        });
        await pc.setLocalDescription(offer);

        const sigRef = ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${peerUid}/${this.currentUid}/offer`);
        await set(sigRef, {
          type: offer.type,
          sdp: offer.sdp,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.warn(`[VoiceChatService] Error setting up peer connection with ${peerUid}:`, err);
    }
  }

  /**
   * Listen to incoming RTDB signaling messages (offers, answers, candidates)
   */
  private setupSignalingListener() {
    if (!this.roomCode || !this.currentUid) return;

    const mySignalingRef = ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${this.currentUid}`);
    const unsub = onValue(mySignalingRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      for (const fromUid of Object.keys(data)) {
        const msg = data[fromUid];
        if (!msg) continue;

        let pc = this.peerConnections.get(fromUid);

        // Handle incoming Offer
        if (msg.offer && (!pc || pc.signalingState === 'stable' || pc.signalingState === 'closed')) {
          if (!pc) {
            await this.setupPeerConnection(fromUid, false);
            pc = this.peerConnections.get(fromUid);
          }
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
              const answer = await pc.createAnswer({ offerToReceiveAudio: true });
              await pc.setLocalDescription(answer);

              // Send answer back to fromUid
              const answerRef = ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${fromUid}/${this.currentUid}/answer`);
              await set(answerRef, {
                type: answer.type,
                sdp: answer.sdp,
                timestamp: Date.now()
              });

              // Clean consumed offer
              remove(ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${this.currentUid}/${fromUid}/offer`));
            } catch (e) {
              console.warn(`[VoiceChatService] Error processing offer from ${fromUid}:`, e);
            }
          }
        }

        // Handle incoming Answer
        if (msg.answer && pc && pc.signalingState === 'have-local-offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
            remove(ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${this.currentUid}/${fromUid}/answer`));
          } catch (e) {
            console.warn(`[VoiceChatService] Error processing answer from ${fromUid}:`, e);
          }
        }

        // Handle incoming ICE Candidates
        if (msg.candidates && pc) {
          for (const candKey of Object.keys(msg.candidates)) {
            const cand = msg.candidates[candKey];
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
              remove(ref(rtdb, `rooms/${this.roomCode}/voiceSignaling/${this.currentUid}/${fromUid}/candidates/${candKey}`));
            } catch (e) {
              // Ignore late or redundant ICE candidate additions
            }
          }
        }
      }
    });

    this.unsubs.push(unsub);
  }

  /**
   * Speaking Detector via AudioContext & AnalyserNode
   */
  private setupSpeakingDetector(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingCounter = 0;
      let silentCounter = 0;

      const checkVolume = () => {
        if (!this.analyser || !this.state.isInVoice || this.state.isMuted) {
          if (this.state.isSpeaking) {
            this.state.isSpeaking = false;
            this.publishLocalVoiceState(this.state.isMuted, false);
            this.notify();
          }
          this.animFrameId = requestAnimationFrame(checkVolume);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for human speech voice volume
        if (average > 18) {
          speakingCounter++;
          silentCounter = 0;
          if (speakingCounter >= 2 && !this.state.isSpeaking) {
            this.state.isSpeaking = true;
            this.publishLocalVoiceState(false, true);
            this.notify();
          }
        } else {
          silentCounter++;
          if (silentCounter > 15 && this.state.isSpeaking) {
            this.state.isSpeaking = false;
            speakingCounter = 0;
            this.publishLocalVoiceState(this.state.isMuted, false);
            this.notify();
          }
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      this.animFrameId = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('[VoiceChatService] Audio analyser setup failed:', e);
    }
  }

  private closePeer(peerUid: string) {
    const pc = this.peerConnections.get(peerUid);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerUid);
    }
    const audio = this.peerAudioElements.get(peerUid);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      this.peerAudioElements.delete(peerUid);
    }
  }

  /**
   * Leave Voice Broadcasting & Release Microphone Hardware
   * (Keeps peerConnections and audio elements intact so user still hears opponents!)
   */
  public leaveVoice() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    // Remove local audio tracks from active peer connections
    this.peerConnections.forEach((pc) => {
      pc.getSenders().forEach((sender) => {
        if (sender.track) {
          try {
            pc.removeTrack(sender);
          } catch (e) {}
        }
      });
    });

    if (this.roomCode && this.currentUid) {
      try {
        remove(ref(rtdb, `rooms/${this.roomCode}/voiceState/${this.currentUid}`));
      } catch (e) {}
    }

    this.state.isInVoice = false;
    this.state.isMuted = false;
    this.state.isSpeaking = false;
    this.state.isConnecting = false;
    this.state.error = null;
    this.notify();
  }

  /**
   * Complete teardown (when leaving room or exiting game entirely)
   */
  public destroy() {
    this.leaveVoice();

    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    this.peerAudioElements.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
    });
    this.peerAudioElements.clear();

    this.mutedPeerIds.clear();

    this.unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {}
    });
    this.unsubs = [];
    this.roomCode = null;
    this.currentUid = null;
    this.state.peers = {};
    this.state.mutedPeerIds = [];
    this.notify();
  }
}
