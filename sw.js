// Listening Post (c) 2026 The Blackthorn Grove. Personal use only.
// Keeps the app on the phone so it opens with no signal.
// Opens instantly from the saved copy, then quietly fetches any update for next time.
// "Check for update" in Settings asks for a fresh copy, which skips the saved one.
const CACHE = 'listening-post-v0.3.4';
const CORE = ['./', './index.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache:'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const fresh = e.request.cache === 'reload' || e.request.cache === 'no-store';
  e.respondWith(caches.open(CACHE).then(async c => {
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (fresh){ const r = await net; return r || (await c.match(e.request, { ignoreSearch:true })) || Response.error(); }
    const hit = await c.match(e.request, { ignoreSearch:true }) || (e.request.mode === 'navigate' ? await c.match('./index.html') : null);
    if (hit){ e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline and not saved yet. Open the app once with signal.', { status:503, headers:{'Content-Type':'text/plain'} });
  }));
});
