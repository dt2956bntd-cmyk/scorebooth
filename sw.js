/* App-shell service worker: makes the installed PWA able to open at all when offline.
   It only caches this app's own HTML/CSS/JS — not MLB API responses or team logos, which
   the app already handles itself via the localStorage snapshot in js/data-loader.js.
   Bump CACHE_NAME whenever the precache list below changes, so old caches get dropped. */
const CACHE_NAME = 'scorebooth-shell-v1';
const PRECACHE = [
  './',
  './index.html',
  './js/constants.js',
  './js/data-loader.js',
  './js/game-helpers.js',
  './js/main.js',
  './js/model.js',
  './js/render-booth.js',
  './js/render-game.js',
  './js/render-schedule-standings.js',
  './js/render-team.js',
  './js/store.js',
  './js/tabs.js',
  './js/team-select.js',
  './js/theme.js',
  './js/utils.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* only intercept same-origin app-shell requests; everything else (MLB API, logos, fonts)
   passes straight through to the network untouched */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      /* stale-while-revalidate: serve the cached shell instantly, refresh it in the background */
      return cached || network;
    })
  );
});
