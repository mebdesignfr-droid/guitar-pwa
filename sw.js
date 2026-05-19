// Service Worker — CAGED Guitare
const CACHE_NAME = 'caged-guitar-v2';

// On installe : on cache uniquement les fichiers locaux (pas d'URLs externes)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './index.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png',
        './apple-touch-icon.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Supprimer les anciens caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Stratégie network-first : essaie le réseau, fallback sur le cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache les ressources locales uniquement
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
