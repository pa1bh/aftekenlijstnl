importScripts("version.js");

if (typeof self.__APP_CACHE_NAME__ !== "string" || self.__APP_CACHE_NAME__.length === 0) {
  throw new Error("version.js moet een niet-lege __APP_CACHE_NAME__ exporteren.");
}

const CACHE_NAME = self.__APP_CACHE_NAME__;
const urlsToCache = [
  "./",
  "index.html",
  "assets/css/styles.css",
  "assets/js/main.js",
  "version.js",
  "manifest.json",
  "favicon.ico"
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching app shell");
      return cache.addAll(urlsToCache);
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
            console.log("Service Worker: Clearing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          if (requestUrl.origin !== self.location.origin) {
            return fetchResponse;
          }

          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return fetchResponse;
        })
        .catch(() => {
          console.log("Service Worker: Fetch failed, offline");
        });
    })
  );
});
