import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import UpdateRequiredDialog from '../components/pwa/UpdateRequiredDialog';
import { applyUpdate, detectWaitingUpdate, getSnapshot, subscribe, watchForUpdates } from '../lib/pwaUpdate';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  installApp: () => Promise<void>;
  isInstalled: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  browser: 'safari' | 'chrome' | 'other';
  updateAvailable: boolean;
  applyUpdate: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');
  const [browser, setBrowser] = useState<'safari' | 'chrome' | 'other'>('other');
  const updateAvailable = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }
    detectWaitingUpdate();
    watchForUpdates();
    const onControllerChange = () => {
      // controller change handled by applyUpdate flow
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    };
  }, []);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();

    // Detect browser
    if (userAgent.includes('crios') || userAgent.includes('chrome')) {
      setBrowser('chrome');
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      setBrowser('safari');
    }

    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
    }

    interface BeforeInstallPromptEvent extends Event {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('Installation prompt not available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleApplyUpdate = () => {
    void applyUpdate();
  };

  return (
    <PWAContext.Provider
      value={{ isInstallable, installApp, isInstalled, platform, browser, updateAvailable, applyUpdate: handleApplyUpdate }}
    >
      {children}
      <UpdateRequiredDialog />
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
