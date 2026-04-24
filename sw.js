const CACHE_NAME = 'amolnama-v21';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  // MAGIC LINE 1: Force the waiting service worker to become the active service worker.
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // MAGIC LINE 2: Tell the new service worker to take control of the app immediately.
  event.waitUntil(clients.claim()); 

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});