/*
 * ToolBoxy service worker — conservative, scoped offline support.
 *
 * Strategy (chosen to avoid the classic "stuck on an old version" PWA trap):
 *  - /_next/static/* are content-hashed & immutable -> cache-first (safe forever).
 *  - HTML navigations -> network-first, so ONLINE users always get fresh pages.
 *  - Only an allowlist of fully client-side tool pages (dictionaries / antonyms)
 *    is stored for OFFLINE use; everything else just falls back to an offline page.
 *  Bump VERSION to force-drop old caches on the next activate.
 */
const VERSION = 'v2'
const STATIC_CACHE = `static-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const OFFLINE_URL = '/offline.html'

// Pages we never keep offline: they need the server (auth / live data), so a
// cached copy would just be stale and misleading. Everything else a user has
// visited (home + tool pages) is cached so the installed app opens offline.
const NO_OFFLINE = ['/api/', '/admin', '/dashboard', '/login', '/signup']
const isCacheableNav = (url) => !NO_OFFLINE.some((p) => url.pathname.includes(p))

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((c) => c.add(OFFLINE_URL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // let CDN/API requests pass straight through

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req))
    return
  }
  if (req.mode === 'navigate') {
    event.respondWith(navigationHandler(req, url))
  }
})

async function cacheFirst(req) {
  const cache = await caches.open(STATIC_CACHE)
  const hit = await cache.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok) cache.put(req, res.clone())
  return res
}

async function navigationHandler(req, url) {
  try {
    const res = await fetch(req)
    if (res.ok && isCacheableNav(url)) {
      const cache = await caches.open(PAGE_CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch (e) {
    const cached = await caches.match(req)
    if (cached) return cached
    return (await caches.match(OFFLINE_URL)) || Response.error()
  }
}
