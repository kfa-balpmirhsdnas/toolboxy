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
 * FAQ block at the bottom of every tool page (rendered by ToolLayout).
 * If the tool has a localized `langTools.<slug>` entry, that is shown (those
 * already include an "is it free?" item). Otherwise a localized common FAQ
 * (`faqCommon`) is shown so every tool has at least the free-to-use answer.
 */
export default function ToolFaq({ slug }: { slug: string }) {
  const t = useTranslations('langTools')
  const c = useTranslations('faqCommon')

  let data: FaqData | undefined
  try {
    const raw = t.raw(slug) as unknown
    if (raw && typeof raw === 'object') data = raw as FaqData
  } catch {
    data = undefined
  }

  const hasCustom = !!data && (!!data.intro || !!(data.faq && data.faq.length))
  const items: FaqItem[] = hasCustom ? data!.faq ?? [] : [{ q: c('q'), a: c('a') }]
  const intro = hasCustom ? data!.intro : undefined

  if (!intro && items.length === 0) return null

  return (
    <section className="max-w-4xl mx-auto px-4 mt-10 text-gray-600">
      {intro && <p className="text-sm leading-relaxed mb-6">{intro}</p>}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.q}</h3>
            <p className="text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
