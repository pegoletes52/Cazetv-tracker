// Service Worker de JB's CazéTV
// Objetivo único: cumplir el requisito de Chrome para permitir la instalación completa de la app
// (sin esto, Chrome solo ofrece "acceso directo", no "instalar app").
//
// Estrategia: red primero, caché como respaldo solo si no hay internet.
// Así nunca se queda pegado en una versión vieja: si hay conexión, siempre trae lo último.
// Nunca cachea las llamadas a la API de YouTube (deben ser siempre en tiempo real).

const CACHE_NAME = "jbcazetv-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Solo nos interesa cachear el documento HTML principal (el "cascarón" de la app)
  const isDocument = req.mode === "navigate" || req.destination === "document";
  if (!isDocument) return; // todo lo demás (API de YouTube, imágenes) pasa directo a la red

  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
