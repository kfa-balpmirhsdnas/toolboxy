'use client'

import { useTranslations } from 'next-intl'

interface FaqItem {
  q: string
  a: string
}
interface FaqData {
  intro?: string
  faq?: FaqItem[]
}

/**
 * Localized intro + FAQ block rendered at the bottom of a tool page for SEO.
 * Content lives in the `langTools.<slug>` message namespace (per locale), so
 * each language version targets its own search keywords. Renders nothing if
 * the slug has no entry.
 */
export default function ToolFaq({ slug }: { slug: string }) {
  const t = useTranslations('langTools')

  let data: FaqData | undefined
  try {
    const raw = t.raw(slug) as unknown
    if (raw && typeof raw === 'object') data = raw as FaqData
  } catch {
    data = undefined
  }
  if (!data || (!data.intro && !data.faq?.length)) return null

  return (
    <section className="max-w-4xl mx-auto px-4 mt-10 text-gray-600">
      {data.intro && <p className="text-sm leading-relaxed mb-6">{data.intro}</p>}
      {data.faq?.length ? (
        <div className="space-y-4">
          {data.faq.map((item, i) => (
            <div key={i} className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.q}</h3>
              <p className="text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
