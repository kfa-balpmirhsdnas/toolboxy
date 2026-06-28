'use client'

import { useEffect } from 'react'

// Safety net only: blindly refresh on reopen if the app sat in the background this
// long. Kept generous so normal use (switching apps, a meeting, lunch) never reloads
// — the common case is handled by the "new version shipped" check below instead.
const AWAY_MS = 4 * 60 * 60 * 1000 // 4 hours

/**
 * Installed-PWA freshness. A web app can't close itself when minimised, but a
 * backgrounded PWA can resume to a stale in-memory page. We want a fresh copy on
 * reopen WITHOUT interrupting active use, so (only as an installed app, only when
 * online) we reload on reopen when EITHER:
 *   - a new app version actually took control while we were away (service-worker
 *     `controllerchange`), so the reload delivers something new; or
 *   - the app sat backgrounded for a very long time (AWAY_MS safety net).
 * Otherwise we just quietly ask the service worker to check for an update and never
 * reload — so editing a note and glancing away no longer blows the page away.
 * Regular browser tabs are unaffected.
 */
export default function StandaloneRefresh() {
  useEffect(() => {
    if (!window.matchMedia('(display-mode: standalone)').matches) return
    const sw = navigator.serviceWorker
    let hiddenAt = 0
    let updated = false // a newer service worker took control while this page was open
    const onUpdated = () => {
      updated = true
      // New version landed while backgrounded → refresh now, off-screen, so the
      // reopen is already fresh (no visible flash). If we're in the foreground
      // (active use), don't interrupt — the reopen below will pick it up.
      if (document.visibilityState === 'hidden') location.reload()
    }
    sw?.addEventListener('controllerchange', onUpdated)

    const onVis = () => {
      if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); return }
      if (!hiddenAt || !navigator.onLine) return
      const away = Date.now() - hiddenAt
      if (updated || away > AWAY_MS) { location.reload(); return }
      // No known update and not long away → don't interrupt; just check in the
      // background. If a new version installs (skipWaiting), controllerchange flips
      // `updated`, so the NEXT reopen picks it up.
      sw?.getRegistration().then((r) => r?.update()).catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      sw?.removeEventListener('controllerchange', onUpdated)
    }
  }, [])
  return null
}
