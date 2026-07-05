/*
 * ToolBoxy service worker — conservative, scoped offline support.
 *
 * Strategy (chosen to avoid the classic "stuck on an old version" PWA trap):
 *  - /_next/static/* are content-hashed & immutable -> cache-first (safe forever).
 *  - HTML navigations -> network-first, so ONLINE users always get fresh pages;
 *    every visited page (except auth/live-data + heavy ffmpeg tools) is cached
 *    so pure client-side tools and the installed app open offline.
 *  - Small CDN libraries (pdf.js etc.) -> cache-first, so the tools that pull
 *    them work offline too. The ~30MB ffmpeg core is deliberately NOT cached.
 *  Bump VERSION to force-drop old caches on the next activate.
 */
const VERSION = 'v3'
const STATIC_CACHE = `static-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const CDN_CACHE = `cdn-${VERSION}`
const OFFLINE_URL = '/offline.html'

// Pages we never keep offline: server-backed (auth / live data) so a cached copy
// would be stale, or ffmpeg-based (video/audio) which need a ~30MB CDN core we
// don't cache — better to show the offline page than open-and-break mid-task.
const NO_OFFLINE = [
  '/api/', '/admin', '/dashboard', '/login', '/signup',
  '/video-trimmer', '/audio-trimmer', '/video-to-audio',
]
const isCacheableNav = (url) => !NO_OFFLINE.some((p) => url.pathname.includes(p))

// CDN hosts whose (small) library files we cache for offline tool use.
const CDN_HOSTS = ['unpkg.com', 'cdnjs.cloudflare.com']
const isCacheableCdn = (url) => CDN_HOSTS.includes(url.hostname) && !url.pathname.includes('@ffmpeg/core')

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

// Web Share Target (Android): the OS POSTs the shared file to `<tool>?share-target=1`.
// Stash it in a cache and redirect to the tool page (GET) with ?shared=1, where the page
// picks it up (useSharedFile). A page can't receive a POST, so the SW bridges it.
async function handleShareTarget(request, url) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (file && typeof file.name === 'string') {
      const headers = new Headers()
      headers.set('content-type', file.type || 'application/octet-stream')
      headers.set('x-filename', encodeURIComponent(file.name || 'shared'))
      const cache = await caches.open('share-target')
      await cache.put('/__shared-file', new Response(file, { headers }))
    }
  } catch (e) { /* ignore — fall through to the redirect so the app still opens */ }
  return Response.redirect(url.pathname + '?shared=1', 303)
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method === 'POST' && url.searchParams.has('share-target')) {
    event.respondWith(handleShareTarget(req, url))
    return
  }
  if (req.method !== 'GET') return

  if (url.origin !== self.location.origin) {
    if (isCacheableCdn(url)) event.respondWith(cacheFirst(req, CDN_CACHE))
    return // other cross-origin (incl. ffmpeg core) passes straight to network
  }
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req, STATIC_CACHE))
    return
  }
  if (req.mode === 'navigate') {
    event.respondWith(navigationHandler(req, url))
  }
})

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
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
