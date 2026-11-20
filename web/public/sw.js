/* Yekola PWA — hors ligne : redirige /learn/* vers /offline/learn?u=... */
const CACHE = "yekola-shell-v4";
const OFFLINE_LEARN = "/offline/learn";
const PRECACHE = [
  "/",
  "/catalog",
  "/learn",
  "/offline/learn",
  "/auth/login",
  "/brand/yekola-mark.png",
  "/brand/yekola-wordmark.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      for (const url of PRECACHE) {
        try {
          await cache.add(url);
        } catch (_) {}
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        for (const url of data.urls) {
          try {
            const res = await fetch(url, { credentials: "same-origin" });
            if (res.ok) await cache.put(url, res.clone());
          } catch (_) {}
        }
      })(),
    );
  }
});

function isNavigate(req) {
  return (
    req.mode === "navigate" ||
    (req.method === "GET" && (req.headers.get("accept") || "").includes("text/html"))
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Coquille offline (avec ou sans ?u=)
  if (isNavigate(req) && url.pathname === OFFLINE_LEARN) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) {
            const cache = await caches.open(CACHE);
            await cache.put(OFFLINE_LEARN, res.clone());
          }
          return res;
        } catch (_) {
          const cached = await caches.match(OFFLINE_LEARN, { ignoreSearch: true });
          if (cached) return cached;
          return new Response(
            "<!doctype html><meta charset=utf-8><title>Hors ligne</title><p>Hors ligne. Rouvrez Yekola avec Internet une fois, téléchargez le pack, puis réessayez.</p>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }
      })(),
    );
    return;
  }

  // /learn/* hors ligne → redirection vers coquille
  if (isNavigate(req) && url.pathname.startsWith("/learn")) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) {
            const cache = await caches.open(CACHE);
            cache.put(req, res.clone());
          }
          return res;
        } catch (_) {
          const exact = await caches.match(req);
          if (exact) return exact;
          const dest =
            OFFLINE_LEARN + "?u=" + encodeURIComponent(url.pathname + url.search);
          return Response.redirect(new URL(dest, self.location.origin).href, 303);
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      try {
        const res = await fetch(req);
        if (res.ok && (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/brand/"))) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch (_) {
        if (cached) return cached;
        throw _;
      }
    })(),
  );
});
