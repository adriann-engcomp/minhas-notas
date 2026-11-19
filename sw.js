// Service worker: guarda o app e as fontes para funcionar offline
const CACHE = "notas-03ef595907";
const ARQUIVOS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    // "no-store": ignora o cache HTTP do GitHub Pages (10 min) para o app instalado pegar a versão nova na hora
    e.respondWith(fetch(e.request, { cache: "no-store" }).then(resp => {
      const copia = resp.clone(); caches.open(CACHE).then(c => c.put("index.html", copia)); return resp;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok || resp.type === "opaque") { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return resp;
  }).catch(() => caches.match("index.html"))));
});
