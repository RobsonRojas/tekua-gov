import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./syncService', () => ({
  processSyncQueue: vi.fn(() => Promise.resolve()),
  initSyncListener: vi.fn(),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('pwaUpdate', () => {
  beforeEach(() => {
    // Vitest runs with import.meta.env.DEV === true, which disables the update flow.
    vi.stubEnv('DEV', false);
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('detectWaitingUpdate signals when registration.waiting exists', async () => {
    const getRegistration = vi.fn(() => Promise.resolve({ waiting: {} }));
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { getRegistration },
      writable: true,
    });

    const mod = await import('./pwaUpdate');
    await mod.detectWaitingUpdate();
    expect(mod.isUpdateAvailable()).toBe(true);
  });

  it('watchForUpdates signals on installed with controller', async () => {
    const installing = {
      state: 'installing',
      _handler: null as ((...args: unknown[]) => void) | null,
      addEventListener: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'statechange') {
          installing._handler = handler;
        }
      }),
    };
    const registration = {
      installing,
      _updatefound: null as ((...args: unknown[]) => void) | null,
      addEventListener: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'updatefound') {
          registration._updatefound = handler;
        }
      }),
    };
    const getRegistration = vi.fn(() => Promise.resolve(registration));
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { getRegistration, controller: {} },
      writable: true,
    });

    const mod = await import('./pwaUpdate');
    mod.watchForUpdates();
    await flushPromises();
    registration._updatefound?.();
    installing.state = 'installed';
    installing._handler?.();
    expect(mod.isUpdateAvailable()).toBe(true);
  });

  it('applyUpdate processes queue, posts SKIP_WAITING, waits for controllerchange or timeout, then reloads', async () => {
    const sync = await import('./syncService');
    const postMessage = vi.fn();
    const getRegistration = vi.fn(() => Promise.resolve({ waiting: { postMessage } }));
    const removeEventListener = vi.fn();
    const addEventListener = vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (event === 'controllerchange') {
        setTimeout(() => handler(), 10);
      }
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { getRegistration, addEventListener, removeEventListener },
      writable: true,
    });
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload },
      writable: true,
    });

    const mod = await import('./pwaUpdate');
    await mod.applyUpdate();

    expect(vi.mocked(sync.processSyncQueue)).toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(reload).toHaveBeenCalled();
  });

  it('applyUpdate falls back to reload on timeout', async () => {
    const sync = await import('./syncService');
    const postMessage = vi.fn();
    const getRegistration = vi.fn(() => Promise.resolve({ waiting: { postMessage } }));
    const removeEventListener = vi.fn();
    const addEventListener = vi.fn(() => {
      // never call handler
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { getRegistration, addEventListener, removeEventListener },
      writable: true,
    });
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload },
      writable: true,
    });

    vi.useFakeTimers();
    const mod = await import('./pwaUpdate');
    const p = mod.applyUpdate();
    await vi.advanceTimersByTimeAsync(6000);
    await p;
    vi.useRealTimers();

    expect(vi.mocked(sync.processSyncQueue)).toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(reload).toHaveBeenCalled();
  });
});
