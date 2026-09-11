// NAVO VYAPAR — Offline PWA Service Worker
const CACHE_NAME = 'navo-vyapar-v1';
const STATIC_SHELL = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/assets/images/navo_hero.jpg',
  '/assets/images/light_tabletop_wood.jpg',
  '/assets/images/board_center_clean.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL).catch((err) => {
        console.warn('PWA caching partial:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first with cache fallback
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
