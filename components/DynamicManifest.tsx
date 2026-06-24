'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Points the <link rel="manifest"> at /api/manifest with the current page's path
 * (start_url + id) and the tool's display name. Because id is the page path,
 * each tool installs as its own distinct app with its own home-screen icon and
 * name; installing from the home page still yields the full "ToolBoxy" app.
 * Runs slightly after navigation so document.title has settled to the new page.
 */
export default function DynamicManifest() {
  const pathname = usePathname()
  useEffect(() => {
    if (typeof document === 'undefined') return
    const id = setTimeout(() => {
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'manifest'
        document.head.appendChild(link)
      }
      // Title is "<Tool name> – <subtitle> | ToolBoxy"; keep just the tool name.
      const label = (document.title || '').split(/\s+[–—|]\s+/)[0].trim()
      const params = new URLSearchParams({ start: pathname || '/en' })
      if (label && label.toLowerCase() !== 'toolboxy') params.set('name', label)
      link.href = `/api/manifest?${params.toString()}`
    }, 60)
    return () => clearTimeout(id)
  }, [pathname])
  return null
}
