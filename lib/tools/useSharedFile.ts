import { useEffect } from 'react'

/**
 * Web Share Target (Android): the OS share sheet POSTs the shared file to the app; our
 * service worker stashes it in the 'share-target' cache and redirects the app here with
 * ?shared=1. On mount we pick that file up, hand it to the tool, then clear the cache
 * entry and drop the ?shared flag from the URL so a refresh doesn't re-open it.
 *
 * Desktop "Open with" uses launchQueue instead (File Handling API); this is the mobile path.
 */
export function useSharedFile(onFile: (file: File) => void) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof caches === 'undefined') return
    if (!new URLSearchParams(window.location.search).has('shared')) return
    let cancelled = false
    ;(async () => {
      try {
        const cache = await caches.open('share-target')
        const res = await cache.match('/__shared-file')
        if (res) {
          const blob = await res.blob()
          const name = decodeURIComponent(res.headers.get('x-filename') || 'shared')
          const type = res.headers.get('content-type') || blob.type || 'application/octet-stream'
          await cache.delete('/__shared-file')
          if (!cancelled) onFile(new File([blob], name, { type }))
        }
      } catch { /* ignore — no shared file / cache unavailable */ }
      try {
        const u = new URL(window.location.href)
        u.searchParams.delete('shared')
        window.history.replaceState({}, '', u.pathname + u.search)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
