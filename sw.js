// 词海远征 Service Worker - 离线缓存
const CACHE_NAME = 'wordquest-v2';
const FILES = [
  '.',
  'index.html',
  'manifest.json',
  'icon.svg'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
    ))
  );
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  // 导航/HTML 请求 → 网络优先,失败回退缓存(不再永久缓存旧 index.html)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 其余静态资源(manifest.json、icon.svg 等) → 缓存优先
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return resp;
        })
      )
    );
  }
});
