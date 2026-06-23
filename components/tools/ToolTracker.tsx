'use client'

import { useEffect, useRef } from 'react'
import { trackToolView } from '@/lib/gtag'

export default function ToolTracker({ slug }: { slug: string }) {
  const countedSlug = useRef<string | null>(null)

  useEffect(() => {
    trackToolView(slug)

    // Self-hosted per-tool view counter (fire-and-forget). Guard against
    // double-count from re-renders / strict-mode remounts of the same slug.
    if (countedSlug.current === slug) return
    countedSlug.current = slug
    fetch('/api/tool-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      /* counting is best-effort; never block the tool page */
    })
  }, [slug])

  return null
}
