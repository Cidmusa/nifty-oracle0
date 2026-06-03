// FILE 2: sw.js
// Service Worker - Real caching for PWA
const CACHE_NAME = 'nifty-oracle-v2-real';
const STATIC_ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // NEVER cache the live API calls (corsproxy, allorigins, yahoo). Always fetch real data.
  if (url.hostname.includes('yahoo') || url.hostname.includes('cors') || url.hostname.includes('allorigins')) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ error: "Offline" }), { status: 503 })));
    return;
  }

  // Cache static UI assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        return response;
      });
    })
  );
});  if (e.tag === 'price-check') {
    e.waitUntil(performBackgroundPriceCheck());
  }
});

async function performBackgroundPriceCheck() {
  // Simulates fetching latest watchlist and triggering push if alert hit
  const triggered = true; // Logic would integrate with IndexedDB to check conditions
  if (triggered) {
    self.registration.showNotification('🚨 Price Alert Triggered', {
      body: 'RELIANCE crossed ₹3,000 resistance level.',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzBCMEMxMCIvPjxwYXRoIGQ9Ik0yMzYgMTAwaDQwdjMxMmgtNDB6IiBmaWxsPSIjMDBENjhGIi8+PHJlY3QgeD0iMTg2IiB5PSIyMDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMTUwIiByeD0iMTYiIGZpbGw9IiMwMEQ2OEYiLz48L3N2Zz4=',
      badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzBCMEMxMCIvPjxwYXRoIGQ9Ik0yMzYgMTAwaDQwdjMxMmgtNDB6IiBmaWxsPSIjMDBENjhGIi8+PHJlY3QgeD0iMTg2IiB5PSIyMDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMTUwIiByeD0iMTYiIGZpbGw9IiMwMEQ2OEYiLz48L3N2Zz4=',
      vibrate: [200, 100, 200]
    });
  }
}

// Push Event Listener
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : { title: 'Market Update', body: 'New signals detected.' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzBCMEMxMCIvPjxwYXRoIGQ9Ik0yMzYgMTAwaDQwdjMxMmgtNDB6IiBmaWxsPSIjMDBENjhGIi8+PHJlY3QgeD0iMTg2IiB5PSIyMDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMTUwIiByeD0iMTYiIGZpbGw9IiMwMEQ2OEYiLz48L3N2Zz4='
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
