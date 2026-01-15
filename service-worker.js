const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/assets/images/logo-72.png",
  "/assets/images/logo-96.png",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache - service-worker.js:16");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Cache installation failed: - service-worker.js:20", error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache: - service-worker.js:33", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If offline and request is for HTML page, show offline page
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline.html");
          }
          // For images, return a fallback image
          if (event.request.url.match(/\.(png|jpg|jpeg|gif)$/)) {
            return caches.match("/assets/images/logo-72.png");
          }
        });
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification!",
    icon: "/assets/images/logo-72.png",
    badge: "/assets/images/logo-72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification("PWA Notification", options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
