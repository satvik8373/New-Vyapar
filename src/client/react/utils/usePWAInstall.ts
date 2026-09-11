import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb());
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((cb) => cb());
  });
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(Boolean(deferredPrompt));
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone =
        (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
        (typeof navigator !== 'undefined' && (navigator as any).standalone === true);
      setIsInstalled(isStandalone);
      setCanInstall(Boolean(deferredPrompt) && !isStandalone);
    };

    checkInstalled();
    const handler = () => checkInstalled();
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt (e.g. iOS Safari)
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        deferredPrompt = null;
        setCanInstall(false);
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.warn('PWA install error:', err);
    }
    return false;
  };

  return { canInstall, isInstalled, installApp };
}
