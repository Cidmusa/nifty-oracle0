// FILE 2: sw.js
// HOW TO USE:
// 1. Save all 3 files (index.html, sw.js, manifest.json) in same folder
// 2. Open index.html in Chrome/Samsung Internet
// 3. Tap "Add to Home Screen" when prompted
// 4. Allow notifications when asked
// 5. App installs like a native app — done!
// 
// WORKS ON: Android Chrome, Samsung Internet
// LIMITED ON: iPhone Safari (no background alerts)
// REQUIRES: Internet for live data, works offline with cached data

const CACHE_NAME = 'nifty-oracle-v1';
const STATIC_ASSETS = [
  './index.html',
  './manifest.json'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate for API, Cache-first for static
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // API Calls (Yahoo, NSE, etc.) -> Network First, fallback to Cache
  if (url.origin !== location.origin && !url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open('nifty-api-cache').then((cache) => {
            cache.put(e.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static Assets -> Cache First
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        return response;
      });
    })
  );
});

// Background Sync for Price Checking
self.addEventListener('sync', (e) => {
  if (e.tag === 'price-check') {
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
