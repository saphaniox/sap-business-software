// Service Worker for SAP Business Management Software
const CACHE_VERSION = 'v2-2026-01-21';
const CACHE_NAME = `sap-bms-${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('sap-bms-') && name !== CACHE_NAME)
          .map(name => {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip unsupported schemes (chrome-extension, chrome, about, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip caching for API requests - always fetch fresh
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Network error, please check your connection' }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Skip caching for POST, PUT, DELETE requests (only GET requests can be cached)
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // For static assets: network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Only cache successful responses from http/https
        if (response.status === 200 && url.protocol.startsWith('http')) {
          // Clone the response
          const responseClone = response.clone();
          
          // Cache the new response (only for GET requests)
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone).catch(err => {
              // Silently fail if caching fails (e.g., for unsupported schemes)
              console.log('Cache put failed:', err.message);
            });
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, return offline page
          return new Response(
            '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
            { 
              status: 503,
              headers: { 'Content-Type': 'text/html' }
            }
          );
        });
      })
  );
});

// Message event - force cache refresh
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('sap-bms-'))
            .map(name => caches.delete(name))
        );
      })
    );
  }
});
