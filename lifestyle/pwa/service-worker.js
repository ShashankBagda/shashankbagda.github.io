/* -------------------------------------------
   service-worker.js — PWA Offline Caching
-------------------------------------------- */

const CACHE_NAME = "lifestyle-cache-v1";

// List everything that should work offline
const FILES_TO_CACHE = [
  "/lifestyle/",
  "/lifestyle/index.html",
  "/lifestyle/dashboard.html",
  "/lifestyle/settings.html",

  "/lifestyle/js/app.js",
  "/lifestyle/js/charts.js",
  "/lifestyle/js/storage.js",
  "/lifestyle/js/scheduler.js",

  "/lifestyle/workers/exercise.js",
  "/lifestyle/workers/food.js",
  "/lifestyle/workers/water.js",
  "/lifestyle/workers/work.js",
  "/lifestyle/workers/sleep.js",

  "/lifestyle/assets/icon-192.png",
  "/lifestyle/assets/icon-512.png",

  "/lifestyle/pwa/manifest.json"
];

self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app files...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match("/lifestyle/index.html"))
      );
    })
  );
});
