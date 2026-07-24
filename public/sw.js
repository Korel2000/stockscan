const CACHE = 'stockscan-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Real push notification received from the server (via web-push / VAPID)
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data.json(); } catch (err) { data = { title: 'StockScan', body: e.data ? e.data.text() : '' }; }
  const title = data.title || 'התראת מניה חמה 🔥';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    dir: 'rtl',
    data: data.url || '/scanner'
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data || '/scanner'));
});
