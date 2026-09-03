// Service Worker de JB's CazéTV
// Sube este archivo en la MISMA carpeta que index.html y manifest.json en GitHub Pages.
// Sirve para dos cosas: 1) que Chrome/Android consideren la app "instalable de verdad"
// (no un simple acceso directo), y 2) que la app abra aunque no haya internet en ese momento
// (mostrará la última pantalla guardada; la programación en vivo sí necesita conexión).

const CACHE_NAME = "jb-cazetv-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: intenta primero la red (para tener siempre la última versión y datos
// en vivo); si falla (sin internet), responde con lo que haya en caché.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
