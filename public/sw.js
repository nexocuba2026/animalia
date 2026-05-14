const CACHE_NAME = 'animalia-v3'

const PRECACHE_URLS = [
  '/animalia/',
  '/animalia/index.html',
  '/logo.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (
          networkResponse.ok &&
          (event.request.url.endsWith('.js') ||
           event.request.url.endsWith('.css') ||
           event.request.url.endsWith('.woff2'))
        ) {
          const clonedResponse = networkResponse.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse))
        }
        return networkResponse
      })
      return cachedResponse || fetchPromise
    })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  )
})