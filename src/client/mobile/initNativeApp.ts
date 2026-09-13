import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Initializes native mobile capabilities (Android & iOS) when running inside Capacitor.
 * Safe to call on Web / Desktop browsers (no-ops gracefully).
 */
export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Configure Android / iOS Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#080f23' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.warn('[NativeApp] StatusBar initialization warning:', err);
  }

  try {
    // 2. Hide Native Splash Screen smoothly once React has mounted
    await SplashScreen.hide({
      fadeOutDuration: 400
    });
  } catch (err) {
    console.warn('[NativeApp] SplashScreen hide warning:', err);
  }
}
