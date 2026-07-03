const CACHE_NAME = "bgp-pwa-v1-4-2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./buy-property.html",
  "./sell-property.html",
  "./post-requirement.html",
  "./builders.html",
  "./how-it-works.html",
  "./services.html",
  "./contact.html",
  "./customer-login.html",
  "./customer-dashboard.html",
  "./refer-and-win.html",
  "./property-details.html",
  "./backend-test.html",
  "./offline.html",
  "./css/style.css",
  "./js/config.js",
  "./js/main.js",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not cache Google Apps Script API calls. Always try network.
  if (url.hostname.includes("script.google.com") || url.hostname.includes("googleusercontent.com")) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({
        ok: false,
        message: "You are offline. Backend connection unavailable."
      }), {
        headers: { "Content-Type": "application/json" }
      }))
    );
    return;
  }

  // HTML pages: network first, fallback to cache/offline.
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("./offline.html")))
    );
    return;
  }

  // Static assets: cache first, then network.
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
