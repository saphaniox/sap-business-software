// Service Worker for SAP Business Management Software
// Auto-clear cache on every version change
const CACHE_VERSION = 'v3-' + new Date().toISOString().split('T')[0] + '-' + Date.now();
const CACHE_NAME = `sap-bms-${CACHE_VERSION}`;

// Clear all old caches immediately
const clearAllCaches = async () => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => {
      console.log('Service Worker: Clearing cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
};

// Assets to cache immediately (minimal for fresh content)
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing new version...');
  event.waitUntil(
    clearAllCaches() // Clear all old caches first
      .then(() => caches.open(CACHE_NAME))
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skipping waiting to activate immediately');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up ALL old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating new version...');
  event.waitUntil(
    clearAllCaches()
      .then(() => {
        console.log('Service Worker: All caches cleared, claiming clients');
        return self.clients.claim();
      })
      .then(() => {
        // Force reload all clients to get fresh content
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            console.log('Service Worker: Reloading client:', client.url);
            client.navigate(client.url);
          });
        });
      })
  );
});

// Fetch event - ALWAYS fetch fresh, minimal caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  try {
    const url = new URL(request.url);
    
    // Skip unsupported schemes (chrome-extension, chrome, about, etc.)
    if (!url.protocol.startsWith('http')) {
      return;
    }
    
    // ALWAYS fetch API requests fresh - NEVER cache
    if (request.url.includes('/api/') || request.url.includes('koyeb.app')) {
      event.respondWith(
        fetch(request, { cache: 'no-store' }).catch(() => {
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

    // Skip caching for POST, PUT, DELETE requests
    if (request.method !== 'GET') {
      event.respondWith(fetch(request));
      return;
    }
    
    // For static assets: ALWAYS fetch fresh (no cache-first strategy)
    event.respondWith(
      fetch(request, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(response => {
          // DON'T cache - always fetch fresh
          return response;
        })
        .catch(() => {
          // If network fails, try cache as last resort
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              console.log('Service Worker: Serving from cache (offline):', request.url);
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
  } catch (error) {
    console.error('Service Worker fetch error:', error);
    // Fallback for any errors
    event.respondWith(fetch(request));
  }
});

// Message event - allow manual cache clear from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Manual cache clear requested');
    event.waitUntil(
      clearAllCaches().then(() => {
        console.log('Service Worker: All caches cleared manually');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});
