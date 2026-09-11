import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase/firebaseConfig';

export class NetworkQualityService {
  private static instance: NetworkQualityService | null = null;
  private currentPing: number = 32;
  private listeners: Set<(ping: number) => void> = new Set();
  private intervalId: any = null;
  private isMeasuring: boolean = false;

  private constructor() {
    this.startMeasurement();
  }

  public static getInstance(): NetworkQualityService {
    if (!NetworkQualityService.instance) {
      NetworkQualityService.instance = new NetworkQualityService();
    }
    return NetworkQualityService.instance;
  }

  public getPing(): number {
    return this.currentPing;
  }

  public subscribe(listener: (ping: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentPing);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentPing);
      } catch (err) {
        console.error('[NetworkQualityService] Listener error:', err);
      }
    });
  }

  /**
   * Measure round-trip time to Firebase RTDB server with smooth exponential moving average
   */
  public async measurePing(): Promise<number> {
    if (this.isMeasuring) return this.currentPing;
    this.isMeasuring = true;

    try {
      const startTime = performance.now();
      const connectedRef = ref(rtdb, '.info/connected');
      await get(connectedRef);
      const rtt = Math.round(performance.now() - startTime);

      // Smooth jitter with exponential moving average (60% previous, 40% sample)
      if (rtt > 0 && rtt < 1200) {
        this.currentPing = Math.round(this.currentPing * 0.6 + rtt * 0.4);
        this.notify();
      }
    } catch {
      // Fallback probe via lightweight asset if RTDB call fails
      try {
        const startTime = performance.now();
        await fetch(`/vite.svg?_t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
        const rtt = Math.round(performance.now() - startTime);
        if (rtt > 0 && rtt < 1200) {
          this.currentPing = Math.round(this.currentPing * 0.6 + rtt * 0.4);
          this.notify();
        }
      } catch {
        // Keep previous reading
      }
    } finally {
      this.isMeasuring = false;
    }

    return this.currentPing;
  }

  public startMeasurement() {
    if (this.intervalId) return;
    // Initial probe
    this.measurePing();
    // Periodic probe every 3 seconds for accurate, stable ping
    this.intervalId = setInterval(() => {
      this.measurePing();
    }, 3000);
  }

  public stopMeasurement() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
