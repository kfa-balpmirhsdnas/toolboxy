'use client'

import { useEffect } from 'react'
import { trackToolView } from '@/lib/gtag'

export default function ToolTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackToolView(slug)
  }, [slug])
  return null
}
