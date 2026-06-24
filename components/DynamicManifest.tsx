'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Points the <link rel="manifest"> at /api/manifest?start=<current path> so that
 * installing the PWA captures the exact page (and locale) the user is on as the
 * app's start_url. Updates on every navigation, so the manifest seen at install
 * time always reflects where the user actually is.
 */
export default function DynamicManifest() {
  const pathname = usePathname()
  useEffect(() => {
    if (typeof document === 'undefined') return
    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'manifest'
      document.head.appendChild(link)
    }
    link.href = `/api/manifest?start=${encodeURIComponent(pathname || '/en')}`
  }, [pathname])
  return null
}
