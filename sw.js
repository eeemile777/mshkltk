
const CACHE_NAME = 'mshkltk-cache-v4';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/src/index.tsx',
  '/src/App.tsx'
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
  const url = new URL(event.request.url);
  
  // NEVER cache API requests - always go to network, but handle offline gracefully
  if (url.pathname.startsWith('/api/') || url.origin.includes(':3001')) {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(err => {
          console.warn('API request failed (offline?):', event.request.url, err);
          // For API requests, return a proper error response that the app can parse
          return new Response(
            JSON.stringify({ error: 'Network error. Please check your connection.' }),
            { 
              status: 503, 
              statusText: 'Service Unavailable', 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
    return;
  }

  // NEVER cache chrome-extension or other non-http(s) schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    event.respondWith(
      fetch(event.request).catch(err => {
        console.warn('Fetch failed for non-http(s):', event.request.url);
        return new Response('Network error', { status: 503 });
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first strategy for static assets only (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            // Only cache successful responses for static assets
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              }).catch(err => {
                console.warn('Failed to cache:', err);
              });
            }
            return networkResponse;
          });
      })
  );
});

// SECURITY FIX #11: Prevent duplicate event listener registration
let syncHandlerRegistered = false;

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