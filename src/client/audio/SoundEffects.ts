/**
 * Procedural Web Audio API sound effects synthesizer.
 * Provides instant tactile sound without external MP3 dependencies,
 * with clean hooks for custom audio files.
 */
export class SoundEffects {
  private static instance: SoundEffects;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = typeof window !== 'undefined' ? localStorage.getItem('navo_audio_muted') === 'true' : false;
  private listeners: Set<(isMuted: boolean) => void> = new Set();

  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isPreloading: boolean = false;
  private carDriveSource: AudioBufferSourceNode | null = null;
  private carDriveGain: GainNode | null = null;

  private constructor() {
    // AudioContext will be lazily initialized on first user interaction
    if (typeof window !== 'undefined') {
      const preloadOnInteraction = () => {
        this.getContext();
        window.removeEventListener('click', preloadOnInteraction);
        window.removeEventListener('keydown', preloadOnInteraction);
        window.removeEventListener('touchstart', preloadOnInteraction);
      };
      window.addEventListener('click', preloadOnInteraction, { once: true });
      window.addEventListener('keydown', preloadOnInteraction, { once: true });
      window.addEventListener('touchstart', preloadOnInteraction, { once: true });
    }
  }

  public static getInstance(): SoundEffects {
    if (!SoundEffects.instance) {
      SoundEffects.instance = new SoundEffects();
    }
    return SoundEffects.instance;
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.preloadCarAudio();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
      this.preloadCarAudio();
    }
    return this.ctx;
  }

  /**
   * Preload official recorded sports car audio samples into memory
   */
  public async preloadCarAudio(): Promise<void> {
    if (this.isPreloading || typeof window === 'undefined') return;
    this.isPreloading = true;
    const ctx = this.getContext();
    if (!ctx) return;

    const audioFiles: Record<string, string> = {
      'engine': '/assets/audio/car_engine.ogg',
      'skid': '/assets/audio/car_skid.ogg'
    };

    for (const [key, url] of Object.entries(audioFiles)) {
      if (this.audioBuffers.has(key)) continue;
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const arrayBuf = await resp.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuf);
          this.audioBuffers.set(key, decoded);
        }
      } catch {
        // Fallback procedural engine tone remains available
      }
    }
  }

  /**
   * Starts a smooth, minimal, continuous car moving hum while the car travels.
   * Minimal, gentle, and realistic — no repetitive beeps or multiple loud bursts.
   */
  public startCarMoving(): void {
    if (this.isMuted) {
      this.stopCarMoving();
      return;
    }
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopCarMoving();

    const now = ctx.currentTime;
    const engineBuf = this.audioBuffers.get('engine');

    if (engineBuf) {
      const source = ctx.createBufferSource();
      source.buffer = engineBuf;
      source.loop = true;
      source.playbackRate.value = 1.05;

      const gain = ctx.createGain();
      // Very gentle volume: 0.12 (calm, minimal background cruise)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.12);

      source.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      this.carDriveSource = source;
      this.carDriveGain = gain;
      return;
    }

    this.preloadCarAudio();
  }

  /**
   * Cleanly stops the car moving sound when the car halts.
   */
  public stopCarMoving(): void {
    if (this.carDriveGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.carDriveGain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      } catch {}
    }
    if (this.carDriveSource) {
      const s = this.carDriveSource;
      setTimeout(() => {
        try { s.stop(); s.disconnect(); } catch {}
      }, 90);
      this.carDriveSource = null;
      this.carDriveGain = null;
    }
  }

  /**
   * Called on each tile transition. Kept clean and minimal without multiple sounds.
   */
  public playCarDriveStep(_stepIndex: number = 1, _totalSteps: number = 6): void {
    // Kept silent so the smooth continuous startCarMoving() purr plays undisturbed
  }

  public subscribe(cb: (isMuted: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.isMuted);
    return () => this.listeners.delete(cb);
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('navo_audio_muted', String(muted));
      } catch {}
    }
    if (this.isMuted) {
      this.stopCarMoving();
    }
    this.listeners.forEach((cb) => {
      try {
        cb(this.isMuted);
      } catch {}
    });
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound when dice is rolled (rattling tumble)
   */
  public playDiceRoll(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const count = 7;
    for (let i = 0; i < count; i++) {
      const delay = i * 0.08 + Math.random() * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 220, now + delay);
      osc.frequency.exponentialRampToValueAtTime(60, now + delay + 0.05);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.05);
    }
  }

  /**
   * Sound when dice settles on tabletop
   */
  public playDiceLand(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Tactile hop click for token advancing one tile
   */
  public playTokenStep(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }



  /**
   * Realistic sports car tire brake & settle when pulling into destination tile.
   * Plays the ONE normal authentic "Play Tire Skid / Brake" sound at a comfortable volume.
   */
  public playCarBrake(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Crisp, short brake chirp (0.20s) that stops immediately with the car!
    const skidBuf = this.audioBuffers.get('skid');
    if (skidBuf) {
      const source = ctx.createBufferSource();
      source.buffer = skidBuf;
      source.playbackRate.value = 1.32; // Snappy crisp pitch

      const duration = 0.20; // 0.20s duration — no long dragging sound!
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.setValueAtTime(0.26, now + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      source.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + duration);
      return;
    }

    // Trigger preload in case it was not loaded yet
    this.preloadCarAudio();

    // 2. Normal acoustic fallback (short 0.18s)
    const brakeOsc = ctx.createOscillator();
    brakeOsc.type = 'triangle';
    brakeOsc.frequency.setValueAtTime(900, now);
    brakeOsc.frequency.exponentialRampToValueAtTime(350, now + 0.18);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);

    const brakeGain = ctx.createGain();
    brakeGain.gain.setValueAtTime(0.10, now);
    brakeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    brakeOsc.connect(filter);
    filter.connect(brakeGain);
    brakeGain.connect(ctx.destination);

    brakeOsc.start(now);
    brakeOsc.stop(now + 0.18);
  }

  /**
   * Rupee coin sound for money transactions
   */
  public playMoneyChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [1046.5, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.22, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.28);
    });
  }

  /**
   * Triumphant fanfare when property is purchased
   */
  public playPurchaseJingle(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.22);
    });
  }

  /**
   * Deduct tax or rent sound
   */
  public playTaxDeduct(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 329.63]; // G4, E4
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.12, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.18);
    });
  }

  /**
   * Button click feedback
   */
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Sound effect for opponent player leaving or forfeiting the match
   */
  public playPlayerLeft(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(311.13, now); // Eb4
    osc.frequency.setValueAtTime(233.08, now + 0.18); // Bb3

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}
