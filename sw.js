// 词海远征 Service Worker - 离线缓存
const CACHE_NAME = 'wordquest-v1';
const FILES = [
  '.',
  'index.html',
  'manifest.json',
  'icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        if(resp.ok){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      })
    )
  );
});
