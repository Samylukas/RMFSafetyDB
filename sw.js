const CACHE_NAME = 'safety-ms-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './LOGO-removebg-preview (1).png',
  './wmremove-transformed-removebg-preview.png'
];

// تحميل الملفات في الكاش لتسريع التطبيق وعمله أوفلاين
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// استرجاع الملفات من الكاش
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
