// ============================================
// PWA Service Worker
// Version: 2.0
// Cache Strategy: Stale-While-Revalidate
// ============================================

'use strict';

// ============================================
// CONFIGURATION
// ============================================

const APP_VERSION = '2.0.0';
const CACHE_NAME = `pwa-cache-v${APP_VERSION.replace(/\./g, '-')}`;
const OFFLINE_CACHE = 'offline-cache-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',  // Important: Cache the root
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  
  // Core CSS
  '/assets/css/styles.css',
  '/assets/css/fonts.css',
  
  // Core JavaScript
  '/assets/js/app.js',
  '/assets/js/vendor.js',
  
  // Critical images
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/logo.svg',
  '/assets/images/fallback.jpg',
  
  // Fonts
  '/assets/fonts/roboto.woff2',
  
  // Offline page
  '/offline.html'
];

// Assets to cache on demand (runtime caching)
const RUNTIME_CACHE_PATHS = [
  '/api/',
  '/products/',
  '/images/',
  '/assets/'
];

// Network timeout (in milliseconds)
const NETWORK_TIMEOUT = 5000;

// ============================================
// INSTALL EVENT - Cache critical assets
// ============================================

self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing version ${APP_VERSION}`);
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // Pre-cache critical assets
  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Caching core assets');
          return cache.addAll(PRECACHE_ASSETS);
        })
        .then(() => {
          console.log('[Service Worker] All assets cached');
        }),
      
      // Cache offline page separately
      caches.open(OFFLINE_CACHE)
        .then(cache => cache.add('/offline.html'))
    ])
    .catch(error => {
      console.error('[Service Worker] Installation failed:', error);
    })
  );
});

// ============================================
// ACTIVATE EVENT - Clean up old caches
// ============================================

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating new version');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete caches that don't match current name
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log('[Service Worker] Activated and ready');
      // Notify all clients about the update
      sendMessageToClients({ type: 'SW_ACTIVATED', version: APP_VERSION });
    })
  );
});

// ============================================
// FETCH EVENT - Handle network requests
// ============================================

self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.includes('sockjs-node')) {
    return;
  }
  
  const requestUrl = new URL(event.request.url);
  
  // Handle API requests differently
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle image requests
  if (requestUrl.pathname.startsWith('/assets/images/')) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Handle CSS/JS assets
  if (requestUrl.pathname.startsWith('/assets/')) {
    event.respondWith(handleAssetRequest(event.request));
    return;
  }
  
  // Handle HTML pages (for SPA)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleHtmlRequest(event.request));
    return;
  }
  
  // Default cache strategy for other requests
  event.respondWith(
    networkFirstWithCache(event.request)
  );
});

// ============================================
// REQUEST HANDLING STRATEGIES
// ============================================

// Strategy 1: Network First with Cache Fallback (for API calls)
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first with timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
    );
    
    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    // Cache the fresh response
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] API network failed, trying cache:', error);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({ 
        error: 'You are offline',
        timestamp: new Date().toISOString(),
        cached: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Strategy 2: Cache First, Network Update (for images)
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Return cached image immediately
  if (cachedResponse) {
    // Update cache in background
    event.waitUntil(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse);
          }
        })
        .catch(() => {
          // Ignore network errors for background updates
        })
    );
    return cachedResponse;
  }
  
  // Not in cache, try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return fallback image
    return caches.match('/assets/images/fallback.jpg');
  }
}

// Strategy 3: Stale-While-Revalidate (for CSS/JS assets)
async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Always try network for fresh version
  const networkPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, use cache if available
      if (cachedResponse) {
        return cachedResponse;
      }
      throw new Error('Network failed and no cache available');
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cache, wait for network
  return networkPromise;
}

// Strategy 4: Network First for HTML (with offline fallback)
async function handleHtmlRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache, return offline page
    return caches.match('/offline.html');
  }
}

// Default strategy: Network first with cache fallback
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Nothing available
    return new Response('Network error and no cache available', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ============================================
// BACKGROUND SYNC
// ============================================

self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPendingPosts());
  }
  
  if (event.tag === 'sync-settings') {
    event.waitUntil(syncSettings());
  }
});

async function syncPendingPosts() {
  const db = await openDatabase();
  const pendingPosts = await db.getAll('pending_posts');
  
  for (const post of pendingPosts) {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post.data)
      });
      
      if (response.ok) {
        await db.delete('pending_posts', post.id);
        console.log(`[Service Worker] Synced post ${post.id}`);
      }
    } catch (error) {
      console.error(`[Service Worker] Failed to sync post ${post.id}:`, error);
    }
  }
}

async function syncSettings() {
  const settings = await getSettingsFromIndexedDB();
  
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    console.log('[Service Worker] Settings synced');
  } catch (error) {
    console.error('[Service Worker] Settings sync failed:', error);
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: data.timestamp || Date.now(),
    vibrate: data.vibrate || [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'My PWA', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', event => {
  console.log('[Service Worker] Notification closed');
  // You can track notification dismissal here
});

// ============================================
// PERIODIC BACKGROUND SYNC
// ============================================

self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    console.log('[Service Worker] Periodic sync triggered');
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    // Fetch latest content
    const response = await fetch('/api/latest-content');
    const content = await response.json();
    
    // Update cache
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/api/latest-content', new Response(JSON.stringify(content)));
    
    // Notify clients
    sendMessageToClients({ 
      type: 'CONTENT_UPDATED', 
      data: content 
    });
    
    console.log('[Service Worker] Content updated via periodic sync');
  } catch (error) {
    console.error('[Service Worker] Periodic sync failed:', error);
  }
}

// ============================================
// MESSAGE HANDLING (Client ↔ Service Worker)
// ============================================

self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_INFO':
      event.ports[0].postMessage({
        cacheName: CACHE_NAME,
        version: APP_VERSION
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'UPDATE_ASSETS':
      updateAssets(event.data.urls).then(result => {
        event.ports[0].postMessage(result);
      });
      break;
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Send message to all clients
function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

// Clear all caches
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[Service Worker] All caches cleared');
}

// Update specific assets in cache
async function updateAssets(urls) {
  const cache = await caches.open(CACHE_NAME);
  const results = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        results.push({ url, status: 'updated' });
      } else {
        results.push({ url, status: 'failed', error: 'Network error' });
      }
    } catch (error) {
      results.push({ url, status: 'failed', error: error.message });
    }
  }
  
  return results;
}

// IndexedDB helper
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pwa-db', 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending_posts')) {
        const store = db.createObjectStore('pending_posts', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

async function getSettingsFromIndexedDB() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const settings = {};
      request.result.forEach(item => {
        settings[item.key] = item.value;
      });
      resolve(settings);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// ERROR HANDLING
// ============================================

self.addEventListener('error', event => {
  console.error('[Service Worker] Error:', event.error);
  // Report error to analytics
  reportError(event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[Service Worker] Unhandled rejection:', event.reason);
  reportError(event.reason);
});

function reportError(error) {
  // Send error to your error tracking service
  const errorData = {
    type: 'service_worker_error',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    version: APP_VERSION
  };
  
  // You can use Beacon API for error reporting
  navigator.sendBeacon?.('/api/errors', JSON.stringify(errorData));
}

// ============================================
// SERVICE WORKER STARTUP
// ============================================

console.log(`[Service Worker] Started version ${APP_VERSION}`);
console.log(`[Service Worker] Cache name: ${CACHE_NAME}`);
console.log(`[Service Worker] Scope: ${self.registration?.scope || self.scope}`);
