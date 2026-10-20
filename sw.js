/* Sipwise Progressive Web App Service Worker (v1.0) */

const CACHE_NAME = "sipwise-v1";
const ASSETS_TO_CACHE = [
  "./",
  "index.html",
  "beans.html",
  "brew-guide.html",
  "blog.html",
  "manifest.json",
  "css/style.css?v=18",
  "js/config.js?v=18",
  "js/auth.js?v=18",
  "js/inventory.js?v=18",
  "js/equipment.js?v=18",
  "js/journal.js?v=18",
  "js/bookmarks.js?v=18",
  "js/reviews.js?v=18",
  "js/beans.js?v=18",
  "js/blog.js?v=18",
  "js/calculator.js?v=18",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "icons/favicon.svg"
];

// 1. Install & precache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("Sipwise SW: Precaching skipped some non-critical resources", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate & clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch strategy: Network first with cache fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;
  
  // Skip cross-origin or POST/PUT requests
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // If response is valid, update cache asynchronously
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network failed (offline in kitchen), serve from cache
        const cached = await caches.match(req);
        if (cached) return cached;
        // Fallback for page navigation to index.html
        if (req.mode === "navigate") {
          return caches.match("index.html");
        }
        return null;
      })
  );
});
