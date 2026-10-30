const CACHE_NAME = 'amit-workout-studio-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './data/exercises.json',
  'https://cdn.jsdelivr.net/npm/@musclemap/assets@1.1.0/+esm',
  'https://cdn.jsdelivr.net/npm/@musclemap/assets@1.1.0/bodies/male-front.webp',
  'https://cdn.jsdelivr.net/npm/@musclemap/assets@1.1.0/bodies/male-back.webp',
  'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/data/exercises.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(CORE_ASSETS.map((url) => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});