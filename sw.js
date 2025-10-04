
const CACHE_NAME = 'mshkltk-cache-v3';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(APP_SHELL_URLS).catch(err => {
        console.error('Failed to cache app shell:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Network-first strategy for all other requests (assets, API calls etc.)
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Check for a valid response to cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, fall back to cache
        return caches.match(event.request).then(cachedResponse => {
          // If the request is in the cache, return it. Otherwise, the fetch will fail.
          return cachedResponse; 
        });
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-reports') {
    console.log('Service Worker: Sync event triggered.');
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        if (clients && clients.length) {
          clients.forEach(client => {
            client.postMessage({ type: 'PERFORM_SYNC' });
          });
        }
      })
    );
  }
});