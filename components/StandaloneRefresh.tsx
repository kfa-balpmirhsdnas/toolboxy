'use client'

import { useEffect } from 'react'

// How long the app must have been backgrounded before a reopen triggers a refresh.
// Short switches (glancing at another app) don't reload; genuine reopens do.
const AWAY_MS = 30_000

/**
 * Installed-PWA freshness. A web app can't close itself when minimised, but a
 * backgrounded PWA can resume to a stale in-memory page. So, ONLY when running as
 * an installed app (display-mode: standalone), reload on reopen after it's been
 * in the background a while — giving an online refresh each time it's opened.
 * Regular browser tabs are unaffected, and we only reload when online so the
 * cached/offline copy is never replaced by a network error.
 */
export default function StandaloneRefresh() {
  useEffect(() => {
    if (!window.matchMedia('(display-mode: standalone)').matches) return
    let hiddenAt = 0
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else if (hiddenAt && Date.now() - hiddenAt > AWAY_MS && navigator.onLine) {
        location.reload()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  return null
}
