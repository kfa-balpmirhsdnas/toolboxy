'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker in production only (a SW under the Next.js dev
 * server fights with HMR). Registration is deferred to window 'load' so it never
 * competes with the initial render. Failures are swallowed — the site works
 * exactly the same without it.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])
  return null
}
