import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePushNotifications } from './usePushNotifications';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('usePushNotifications Hook', () => {
  const originalNotification = window.Notification;
  const originalNavigator = window.navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-123' },
    } as any);

    // Mock Notification API
    global.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    } as any;

    // Mock PushManager
    global.PushManager = {} as any;

    // Mock Service Worker API
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            subscribe: vi.fn().mockResolvedValue({
              toJSON: () => ({
                endpoint: 'https://push.example.com/endpoint123',
                keys: {
                  auth: 'auth-key-mock',
                  p256dh: 'p256dh-key-mock',
                },
              }),
            }),
          },
        }),
      },
      configurable: true,
    });

    // Provide a fake base64 string for VAPID
    import.meta.env.VITE_VAPID_PUBLIC_KEY = 'QkNCZUs5LTJueE1EVy14WkJ0eHhRSWp3S2dGX2w0UG1PakhxbkFxakdoYzVmR09UZzhuQXNQMEQ0aWlwT2hYNDRsR2VRS3h5QUHUNlJQMWxIUUpZUWVNPQ==';
  });

  afterEach(() => {
    global.Notification = originalNotification;
    delete (global as any).PushManager;
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: originalNavigator.serviceWorker,
      configurable: true,
    });
  });

  it('initializes with default permission', () => {
    const { result } = renderHook(() => usePushNotifications());
    expect(result.current.permission).toBe('default');
  });

  it('subscribes successfully and saves to supabase', async () => {
    const { result } = renderHook(() => usePushNotifications());

    let success;
    await act(async () => {
      success = await result.current.subscribeUser();
    });

    expect(success).toBe(true);
    expect(global.Notification.requestPermission).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('push_subscriptions');
    expect(supabase.from('push_subscriptions').upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'test-user-123',
        endpoint: 'https://push.example.com/endpoint123',
        auth_key: 'auth-key-mock',
        p256dh_key: 'p256dh-key-mock',
      }),
      expect.anything()
    );
  });

  it('returns false if permission is denied', async () => {
    global.Notification.requestPermission = vi.fn().mockResolvedValue('denied');
    
    const { result } = renderHook(() => usePushNotifications());

    let success;
    await act(async () => {
      success = await result.current.subscribeUser();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Permission not granted for Notification');
    expect(supabase.from('push_subscriptions').upsert).not.toHaveBeenCalled();
  });
});
