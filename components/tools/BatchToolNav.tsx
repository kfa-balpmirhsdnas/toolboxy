'use client'

// Cross-linking between the five batch image tools, for SEO (internal links)
// and for the "continue with these results in another tool" handoff.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BATCH_TOOLS, stashBatch } from '@/lib/batch-image/handoff'

interface Props {
  current: string
  lang: string
  /** Result files from the current tool; when present, "continue" buttons appear. */
  results?: File[] | null
}

export default function BatchToolNav({ current, lang, results }: Props) {
  const router = useRouter()
  const names = useTranslations('toolNames')
  const t = useTranslations('toolui')
  const others = BATCH_TOOLS.filter((b) => b.slug !== current)
  // Drop the descriptive "(...)" suffix from tool names for the compact nav.
  const shortName = (slug: string) => names(slug).split('(')[0].trim()

  function continueWith(slug: string) {
    if (results?.length) stashBatch(results)
    router.push(`/${lang}/tools/${slug}`)
  }

  return (
    <div className="mt-6 space-y-5">
      {/* Continue with results (only after a run) */}
      {results && results.length > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
          <p className="text-sm font-semibold text-brand-800 mb-2">
            {t('bnav_continue', { n: results.length })}
          </p>
          <div className="flex flex-wrap gap-2">
            {others.map((b) => (
              <button
                key={b.slug}
                onClick={() => continueWith(b.slug)}
                className="px-3 py-1.5 rounded-xl bg-white border border-brand-200 text-sm text-brand-700 hover:bg-brand-100 transition-colors"
              >
                {b.emoji} {shortName(b.slug)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related tools (always — internal links) */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-2">{t('bnav_related')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {others.map((b) => (
            <Link
              key={b.slug}
              href={`/${lang}/tools/${b.slug}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-brand-400 hover:bg-brand-50 transition-colors"
            >
              <span>{b.emoji}</span>
              <span className="truncate">{shortName(b.slug)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
