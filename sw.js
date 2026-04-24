const CACHE_NAME = 'sotreq-agrishow-v10';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/app_icon.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Instalação do Service Worker e cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
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

// Interceptação das requisições para oferecer suporte offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se encontrar, senão busca na rede
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Salva a nova requisição em cache para futuro (ótimo para imagens placehold.co)
          if(event.request.url.startsWith('http')) {
             cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // Se a rede falhar e não estiver em cache, poderia mostrar página de erro.
    })
  );
});
