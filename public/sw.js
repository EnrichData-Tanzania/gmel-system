const CACHE_NAME = 'gmel-app-v3';
const APP_ROOT = new URL('./', self.registration.scope);
const APP_SHELL = ['manifest.webmanifest', 'app-icon.svg'].map(path => new URL(path, APP_ROOT).href);
const APP_ROOT_URL = APP_ROOT.href;

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const response = await fetch(APP_ROOT_URL);
      if (!response.ok) throw new Error('Unable to load the app shell for offline use.');
      const html = await response.clone().text();
      const assets = Array.from(
        html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
        match => new URL(match[1], response.url).href
      );
      const cache = await caches.open(CACHE_NAME);
      await cache.put(APP_ROOT_URL, response);
      await cache.addAll([...APP_SHELL, ...assets]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('gmel-app-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('/', response.clone())));
        }
        return response;
      } catch {
        return caches.match(APP_ROOT_URL);
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())));
    }
    return response;
  })());
});
