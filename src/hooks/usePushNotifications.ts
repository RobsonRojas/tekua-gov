import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Utility to convert VAPID public key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push messaging is not supported in your browser.');
      return false;
    }

    if (!user) {
      setError('User not authenticated.');
      return false;
    }

    setIsSubscribing(true);
    setError(null);

    try {
      // Ask for permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        throw new Error('Permission not granted for Notification');
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Ensure VAPID key is configured
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key is not configured.');
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to Push Manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Extract details
      const subJSON = subscription.toJSON();
      if (!subJSON.endpoint || !subJSON.keys?.auth || !subJSON.keys?.p256dh) {
        throw new Error('Invalid subscription format.');
      }

      // Save to Supabase
      const { error: dbError } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subJSON.endpoint,
        auth_key: subJSON.keys.auth,
        p256dh_key: subJSON.keys.p256dh
      }, { onConflict: 'user_id, endpoint' });

      if (dbError) {
        throw dbError;
      }

      setIsSubscribing(false);
      return true;
    } catch (err: any) {
      console.error('Failed to subscribe user:', err);
      setError(err.message || 'Failed to subscribe to push notifications.');
      setIsSubscribing(false);
      return false;
    }
  };

  return { permission, subscribeUser, isSubscribing, error };
}
