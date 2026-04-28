const CACHE_NAME = 'sotreq-agrishow-v42';
const ASSETS_TO_CACHE = [
  './',
  './index.html?v=42',
  './css/style.css?v=42',
  './js/app.js?v=42',
  './js/data.js?v=42',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/app_icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: !event.request.url.includes('placehold.co') }).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Salva a nova requisição em cache se for GET
          if(event.request.url.startsWith('http') && event.request.method === 'GET') {
             cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      }).catch(() => {
        // Se a rede falhar e for navegação de tela, força carregar o index offline
        if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('./index.html', {ignoreSearch: true});
        }
      });
    })
  );
});
