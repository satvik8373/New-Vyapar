/**
 * Web Speech API in-game Voice Announcer service.
 * Delivers spoken audio commentary for major board game events:
 * dice rolls, property purchases, rent payments, chance cards, jail events, and monopolies.
 */
export class VoiceAnnouncer {
  private static instance: VoiceAnnouncer;
  private enabled: boolean = typeof window !== 'undefined'
    ? localStorage.getItem('navo_voice_announcer_enabled') !== 'false'
    : true;
  private voice: SpeechSynthesisVoice | null = null;
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private listeners: Set<(enabled: boolean) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer English (India) or English (UK/US)
        const indianVoice = voices.find((v) => v.lang.includes('en-IN'));
        const englishVoice = voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google'));
        this.voice = indianVoice || englishVoice || voices[0] || null;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public static getInstance(): VoiceAnnouncer {
    if (!VoiceAnnouncer.instance) {
      VoiceAnnouncer.instance = new VoiceAnnouncer();
    }
    return VoiceAnnouncer.instance;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('navo_voice_announcer_enabled', String(enabled));
      } catch {}
    }
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.queue = [];
      this.isSpeaking = false;
    }
    this.listeners.forEach((l) => {
      try { l(this.enabled); } catch {}
    });
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  public subscribe(cb: (enabled: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.enabled);
    return () => this.listeners.delete(cb);
  }

  /**
   * Speak a concise in-game announcement
   */
  public announce(text: string): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Clean text: strip emojis, currency symbol details, and excessive punctuation
    const cleanText = text
      .replace(/[^\w\s.,!?'₹-]/gu, '')
      .replace(/₹/g, 'Rupees ')
      .trim();

    if (!cleanText) return;

    // Immediately stop previous speech so new announcement plays immediately
    try {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    } catch {}

    this.queue = [cleanText];
    this.processQueue();
  }

  private processQueue(): void {
    if (this.isSpeaking || this.queue.length === 0) return;
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const nextText = this.queue.shift();
    if (!nextText) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(nextText);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;

      this.isSpeaking = true;

      utterance.onend = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 150);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 100);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
    }
  }
}
