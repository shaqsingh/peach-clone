const CACHE_NAME = 'peach-clone-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/icon.png',
  '/apple-icon.png',
  '/globals.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache auth routes - they need fresh responses for redirects
  if (url.pathname.startsWith('/api/auth') || url.pathname === '/login') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});
