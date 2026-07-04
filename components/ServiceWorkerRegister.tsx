'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker in production only (a SW under the Next.js dev
 * server fights with HMR). Registration is deferred to window 'load' so it never
 * competes with the initial render. Failures are swallowed — the site works
 * exactly the same without it.
 *
 * Also recovers from the "stuck on the splash/first paint" trap: right after a
 * deploy, freshly-served HTML can reference content-hashed JS/CSS chunks that fail
 * to load (network blip on mobile, or an old cached page pointing at gone chunks).
 * When that happens the page can't hydrate and just freezes. We detect the chunk
 * failure and reload ONCE (guarded so it can't loop) to pull the matching assets.
 * This is global, so every tool benefits — not just the video player.
 */
export default function ServiceWorkerRegister() {
  // Register the service worker.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  // Auto-recover from a failed chunk (stale HTML after a deploy) by reloading once.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof window === 'undefined') return
    const KEY = 'tb_chunk_reload_at'
    const tryReload = () => {
      let last = 0
      try { last = Number(sessionStorage.getItem(KEY) || 0) } catch { /* ignore */ }
      if (Date.now() - last < 10000) return // already reloaded very recently → let it surface, don't loop
      try { sessionStorage.setItem(KEY, String(Date.now())) } catch { /* ignore */ }
      window.location.reload()
    }
    const isChunkMessage = (msg?: string, name?: string) =>
      name === 'ChunkLoadError' ||
      /Loading (chunk|CSS chunk)[\s\S]*failed|Failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i.test(msg || '')
    const onError = (e: ErrorEvent) => {
      const tgt = e.target as (HTMLScriptElement & HTMLLinkElement) | null
      if (tgt && (tgt.tagName === 'SCRIPT' || tgt.tagName === 'LINK')) {
        const url = tgt.src || tgt.href || ''
        if (url.includes('/_next/static/')) { tryReload(); return } // a build asset failed to load
      }
      if (isChunkMessage(e.message, (e.error as Error | undefined)?.name)) tryReload()
    }
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as (Error & { name?: string }) | undefined
      if (isChunkMessage(r?.message, r?.name)) tryReload()
    }
    // Capture phase so resource-load errors (which don't bubble) on <script>/<link> are seen.
    window.addEventListener('error', onError, true)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError, true)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
