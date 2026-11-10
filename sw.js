// Offline-Unterstützung: Dateien werden zwischengespeichert.
const CACHE = "slapp-v10";
const FILES = ["./", "index.html", "styles.css", "app.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png",
  "01-rdoeso.js", "02-gewo.js", "03-ds.js", "04-bgb.js", "05-stgb.js", "06-umw.js", "07-dguv.js", "08-umm.js", "09-sit.js", "updates.js",
  "font-barlow-400.woff2", "font-barlow-600.woff2", "font-barlow-700.woff2", "font-barlow-condensed-600.woff2", "font-barlow-condensed-700.woff2"];
// Beim Installieren alles frisch vom Server holen, nicht aus dem Browser-Zwischenspeicher
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
// Immer beim Server nachfragen (GitHub Pages erlaubt sonst bis zu 10 Min. alte Kopien); nur offline den Cache nehmen
function fresh(req) {
  if (req.mode !== "navigate") return fetch(new Request(req, { cache: "no-cache" }));
  return fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(r =>
    r.redirected ? r.blob().then(b => new Response(b, { status: r.status, statusText: r.statusText, headers: r.headers })) : r);
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  if (e.request.cache === "no-store") return; // Update-Prüfung geht immer direkt ans Netz
  e.respondWith(fresh(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
