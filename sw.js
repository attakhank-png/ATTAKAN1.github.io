const CACHE_NAME = 'poy-converter-v5-ocr';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './tesseract/tesseract.min.js',
  './tesseract/worker.min.js',
  './tesseract/tesseract-core-lstm.wasm.js',
  './tesseract/tesseract-core-simd-lstm.wasm.js',
  './tesseract/tesseract-core.wasm.js',
  './tesseract/tesseract-core-simd.wasm.js',
  './tesseract/lang/eng.traineddata.gz'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('cache fail', url))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (event.request.method === 'GET' && response.status === 200 && event.request.url.includes(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return caches.match(event.request);
      });
    })
  );
});
