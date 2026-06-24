'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Short icon label per dictionary tool, so each installed app has a
// distinguishable home-screen icon (한=한국어, 일=일본어, 영=영어, ↔=반대말).
const ICON_LABEL: Record<string, string> = {
  'korean-to-japanese': '한일', 'korean-to-english': '한영', 'japanese-to-korean': '일한',
  'english-to-korean': '영한', 'japanese-to-english': '일영', 'english-to-japanese': '영일',
  'korean-antonyms': '한↔', 'japanese-antonyms': '일↔', 'english-antonyms': '영↔',
}

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
      const slug = (pathname || '').split('/').pop() || ''
      if (ICON_LABEL[slug]) params.set('icon', ICON_LABEL[slug])
      link.href = `/api/manifest?${params.toString()}`
    }, 60)
    return () => clearTimeout(id)
  }, [pathname])
  return null
}
