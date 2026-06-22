'use client'

import Link from 'next/link'

interface UsageLimitBannerProps {
  count: number
  limit: number
  lang: string
  slug: string
}

/** Shows a usage counter and upgrade prompt when near/at the daily limit */
export default function UsageLimitBanner({ count, limit, lang, slug }: UsageLimitBannerProps) {
  const remaining = limit - count
  const isExceeded = remaining <= 0
  const isWarning = remaining <= 3 && remaining > 0

  if (!isExceeded && !isWarning) return null

  return (
    <div className={`rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-4 ${
      isExceeded
        ? 'bg-red-50 border border-red-200 text-red-700'
        : 'bg-amber-50 border border-amber-200 text-amber-700'
    }`}>
      <span>
        {isExceeded
          ? `Daily limit reached for this tool (${limit}/${limit} uses). Upgrade to Pro for unlimited access.`
          : `${remaining} free use${remaining === 1 ? '' : 's'} remaining today for this tool.`}
      </span>
      <Link
        href={`/${lang}/pricing`}
        className={`shrink-0 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors ${
          isExceeded
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        Upgrade →
      </Link>
    </div>
  )
}
