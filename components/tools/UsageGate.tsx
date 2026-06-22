'use client'

import { useEffect } from 'react'
import { useUsageLimit } from '@/lib/hooks/useUsageLimit'
import UsageLimitBanner from '@/components/tools/UsageLimitBanner'

interface UsageGateProps {
  slug: string
  lang: string
}

export default function UsageGate({ slug, lang }: UsageGateProps) {
  const { count, limit, isGuest, check } = useUsageLimit(slug)

  useEffect(() => {
    check()
  }, [check])

  // Guests or Pro users don't see the banner
  if (isGuest || limit === null) return null
  // Only show banner when near or at limit
  if (count < limit - 3) return null

  return (
    <div className="mb-4">
      <UsageLimitBanner count={count} limit={limit} lang={lang} slug={slug} />
    </div>
  )
}
