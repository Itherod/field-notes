// Listening Post (c) 2026 The Blackthorn Grove. Personal use only.
// Keeps the app on the phone so it opens with no signal.
// Opens instantly from the saved copy, then quietly fetches any update for next time.
const CACHE = 'listening-post-v0.3';
const CORE = ['./', './index.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch:true }) || (e.request.mode === 'navigate' ? await c.match('./index.html') : null);
    const fresh = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit){ e.waitUntil(fresh); return hit; }
    return (await fresh) || new Response('Offline and not saved yet. Open the app once with signal.', { status:503, headers:{'Content-Type':'text/plain'} });
  }));
});
