const CACHE_NAME = 'animalia-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/animalia/',
        '/animalia/index.html',
        '/logo.png',
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Cachear archivos JS y CSS automáticamente
        if (networkResponse.ok && (event.request.url.endsWith('.js') || event.request.url.endsWith('.css'))) {
          const clonedResponse = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
        }
        return networkResponse
      })
    })
  )
})