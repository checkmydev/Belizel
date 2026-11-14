/* Belizel — service worker : l'interface et les données publiques restent disponibles hors connexion.
   Réseau d'abord pour les pages (contenu frais), cache d'abord pour les images et bibliothèques. Jamais de cache pour Supabase ni la météo. */
const V = 'belizel-v3';
const SHELL = ['./', 'index.html', 'admin.html', 'css/style.css', 'css/admin.css', 'js/common.js', 'js/guest.js', 'js/admin.js', 'js/config.js', 'js/i18n.js', 'data/content.nl.js',
  'data/listing.js', 'data/hikes.js', 'data/content.js', 'data/manual.js', 'data/stories.js', 'manifest.webmanifest', 'admin.webmanifest',
  'icons/guest-192.png', 'icons/admin-192.png', 'img/p01.jpg', 'img/p04.jpg', 'img/p20.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || /supabase\.co|open-meteo|elevenlabs/.test(u.host)) return;
  const isAsset = /\.(jpg|png|svg|woff2?)$/.test(u.pathname) || /cdnjs|jsdelivr|fonts\.(googleapis|gstatic)|tile\.(openstreetmap|opentopomap)|arcgisonline/.test(u.host);
  if (isAsset) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok || res.type === 'opaque') { const cl = res.clone(); caches.open(V).then(c => c.put(e.request, cl)); } return res; })));
  } else if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(res => { const cl = res.clone(); caches.open(V).then(c => c.put(e.request, cl)); return res; }).catch(() => caches.match(e.request, {ignoreSearch: true})));
  }
});
