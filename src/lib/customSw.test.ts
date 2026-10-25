import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

type Listener = (event: unknown) => void;

interface FakeClient {
  url: string;
  navigate: ReturnType<typeof vi.fn>;
  focus: ReturnType<typeof vi.fn>;
}

const SW_SOURCE = readFileSync(resolve(process.cwd(), 'public/custom-sw.js'), 'utf8');
const ORIGIN = 'https://portal.test';

const makeClient = (url: string): FakeClient => ({
  url,
  navigate: vi.fn(() => Promise.resolve(null)),
  focus: vi.fn(() => Promise.resolve(null)),
});

// Runs the real custom-sw.js with stubbed globals and captures the listeners it registers.
function loadServiceWorker(windowClients: FakeClient[] = []) {
  const listeners = new Map<string, Listener>();
  const showNotification = vi.fn<(title: string, options: Record<string, unknown>) => Promise<void>>(() => Promise.resolve());
  const openWindow = vi.fn<(url: string) => Promise<null>>(() => Promise.resolve(null));
  const matchAll = vi.fn(() => Promise.resolve(windowClients));

  const self = {
    addEventListener: (type: string, listener: Listener) => {
      listeners.set(type, listener);
    },
    registration: { showNotification },
    location: { origin: ORIGIN },
  };

  runInNewContext(SW_SOURCE, {
    self,
    importScripts: () => {},
    workbox: undefined,
    clients: { matchAll, openWindow },
    URL,
    console,
  });

  const dispatch = async (type: string, event: Record<string, unknown>) => {
    const waits: Promise<unknown>[] = [];
    listeners.get(type)?.({
      ...event,
      waitUntil: (promise: Promise<unknown>) => {
        waits.push(promise);
      },
    });
    await Promise.all(waits);
  };

  return { dispatch, showNotification, openWindow };
}

const jsonPushEvent = (payload: unknown) => ({
  data: { json: () => payload, text: () => JSON.stringify(payload) },
});

const textPushEvent = (text: string) => ({
  data: {
    json: () => {
      throw new SyntaxError('Unexpected token');
    },
    text: () => text,
  },
});

const clickEvent = (data?: { url: string }) => ({
  notification: { data, tag: undefined, close: vi.fn() },
});

describe('custom-sw push handler', () => {
  it('shows title, body and top-level url as data.url', async () => {
    const sw = loadServiceWorker();
    await sw.dispatch('push', jsonPushEvent({ title: 'Nova', body: 'Corpo', url: '/work' }));

    const [title, options] = sw.showNotification.mock.calls[0];
    expect(title).toBe('Nova');
    expect(options).toMatchObject({
      body: 'Corpo',
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico',
      data: { url: '/work' },
    });
  });

  it('falls back to data.url when top-level url is absent', async () => {
    const sw = loadServiceWorker();
    await sw.dispatch('push', jsonPushEvent({ title: 'T', data: { url: '/share/x' } }));

    const [, options] = sw.showNotification.mock.calls[0];
    expect(options).toMatchObject({ data: { url: '/share/x' } });
  });

  it('uses default title, body and root url for an empty payload', async () => {
    const sw = loadServiceWorker();
    await sw.dispatch('push', jsonPushEvent({}));

    const [title, options] = sw.showNotification.mock.calls[0];
    expect(title).toBe('Nova Notificação Tekua');
    expect(options).toMatchObject({ body: 'Você tem uma nova mensagem.', data: { url: '/' } });
  });

  it('uses the text of a non-JSON payload as body', async () => {
    const sw = loadServiceWorker();
    await sw.dispatch('push', textPushEvent('Olá, tudo bem?'));

    const [title, options] = sw.showNotification.mock.calls[0];
    expect(title).toBe('Nova Notificação Tekua');
    expect(options).toMatchObject({ body: 'Olá, tudo bem?', data: { url: '/' } });
  });

  it('shows defaults when the push has no data', async () => {
    const sw = loadServiceWorker();
    await sw.dispatch('push', {});

    const [title, options] = sw.showNotification.mock.calls[0];
    expect(title).toBe('Nova Notificação Tekua');
    expect(options).toMatchObject({ body: 'Você tem uma nova mensagem.', data: { url: '/' } });
  });

  it('groups by tag and renotifies only when a tag is sent', async () => {
    const sw = loadServiceWorker();
    await sw.dispatch('push', jsonPushEvent({ title: 'A', tag: 'task-1', requireInteraction: true }));
    await sw.dispatch('push', jsonPushEvent({ title: 'B' }));

    const [, tagged] = sw.showNotification.mock.calls[0];
    const [, untagged] = sw.showNotification.mock.calls[1];
    expect(tagged).toMatchObject({ tag: 'task-1', renotify: true, requireInteraction: true });
    expect(untagged).toMatchObject({ renotify: false, requireInteraction: false });
  });
});

describe('custom-sw notificationclick handler', () => {
  it('focuses an open app window and navigates it to the relative route', async () => {
    const client = makeClient(`${ORIGIN}/work-wall`);
    const sw = loadServiceWorker([client]);
    await sw.dispatch('notificationclick', clickEvent({ url: '/work' }));

    expect(client.navigate).toHaveBeenCalledWith(`${ORIGIN}/work`);
    expect(client.focus).toHaveBeenCalled();
    expect(sw.openWindow).not.toHaveBeenCalled();
  });

  it('focuses without navigating when the window is already on the route', async () => {
    const client = makeClient(`${ORIGIN}/work`);
    const sw = loadServiceWorker([client]);
    await sw.dispatch('notificationclick', clickEvent({ url: '/work' }));

    expect(client.navigate).not.toHaveBeenCalled();
    expect(client.focus).toHaveBeenCalled();
  });

  it('opens a new window with an absolute URL when no app window is open', async () => {
    const sw = loadServiceWorker([]);
    await sw.dispatch('notificationclick', clickEvent({ url: '/share/surreal/abc' }));

    expect(sw.openWindow).toHaveBeenCalledWith(`${ORIGIN}/share/surreal/abc`);
  });

  it('opens the root when the notification has no url', async () => {
    const sw = loadServiceWorker([]);
    await sw.dispatch('notificationclick', clickEvent());

    expect(sw.openWindow).toHaveBeenCalledWith(`${ORIGIN}/`);
  });

  it('opens a new window when the open client cannot navigate', async () => {
    const client = makeClient(`${ORIGIN}/work-wall`);
    client.navigate.mockImplementation(() => Promise.reject(new Error('not allowed')));
    const sw = loadServiceWorker([client]);
    await sw.dispatch('notificationclick', clickEvent({ url: '/work' }));

    expect(sw.openWindow).toHaveBeenCalledWith(`${ORIGIN}/work`);
  });
});

describe('custom-sw notificationclose handler', () => {
  it('handles a dismissed notification without throwing', async () => {
    const sw = loadServiceWorker();
    await expect(
      sw.dispatch('notificationclose', clickEvent({ url: '/work' }))
    ).resolves.toBeUndefined();
  });
});
