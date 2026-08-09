const CACHE_NAME = "pwa-v1"

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("All resources have been fetched and cached.")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Failed to cache resources:", error)
      }),
  )
})

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        )
      })
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request).catch(() => {
        return caches.match("./fallback.html")
      })
    }),
  )
})
