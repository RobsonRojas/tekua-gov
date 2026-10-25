importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache images
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache fonts
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Year
        }),
      ],
    })
  );
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (typeof self.clients?.claim === 'function') {
        await self.clients.claim();
      }
      if (typeof workbox?.precaching?.cleanupOutdatedCaches === 'function') {
        workbox.precaching.cleanupOutdatedCaches();
      }
    })()
  );
});

function parsePushPayload(event) {
  if (!event.data) {
    return {};
  }
  try {
    const parsed = event.data.json();
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return { body: event.data.text() };
  }
}

function normalizePushPayload(raw) {
  return {
    title: raw.title || 'Nova Notificação Tekua',
    body: raw.body || 'Você tem uma nova mensagem.',
    url: raw.url || (raw.data && raw.data.url) || '/',
    tag: raw.tag,
    requireInteraction: raw.requireInteraction === true,
  };
}

function resolveTargetUrl(url) {
  return new URL(url || '/', self.location.origin).href;
}

self.addEventListener('push', function (event) {
  const payload = normalizePushPayload(parsePushPayload(event));

  const options = {
    body: payload.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    tag: payload.tag,
    renotify: Boolean(payload.tag),
    requireInteraction: payload.requireInteraction,
    data: {
      url: payload.url,
    },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = resolveTargetUrl(event.notification.data && event.notification.data.url);

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      const client = windowClients.find((c) => c.url.startsWith(self.location.origin));

      if (client) {
        try {
          if (client.url !== targetUrl) {
            await client.navigate(targetUrl);
          }
          return client.focus();
        } catch {
          // Client cannot navigate; open a fresh window below.
        }
      }
      return clients.openWindow(targetUrl);
    })()
  );
});

self.addEventListener('notificationclose', function (event) {
  console.debug('Notification dismissed:', event.notification.tag || event.notification.data?.url);
});
