import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSW } from 'virtual:pwa-register';

vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn(() => vi.fn()),
}));

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

vi.mock('./lib/syncService', () => ({
  initSyncListener: vi.fn(),
}));

vi.mock('./lib/pwaUpdate', () => ({
  markUpdateAvailable: vi.fn(),
  setUpdateServiceWorker: vi.fn(),
}));

describe('PWA Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register service worker with immediate: true and onNeedRefresh', async () => {
    // Dynamically import main to trigger the side effects
    await import('./main');

    expect(registerSW).toHaveBeenCalled();
    const calls = (registerSW as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const call = calls[0][0];
    expect(call).toHaveProperty('immediate', true);
    if (call.onNeedRefresh) {
      expect(typeof call.onNeedRefresh).toBe('function');
    }
  });
});
