'use client'

import { useTranslations, useMessages } from 'next-intl'
import { getToolBySlug } from '@/lib/tools/registry'

// Generators/recorders sit in file categories (audio/video/image) but never take
// an upload, so the "are my files sent to a server?" FAQ doesn't apply to them.
const NO_UPLOAD = new Set([
  'white-noise-machine', 'tone-generator', 'voice-recorder', 'screen-recorder', 'webcam-test',
])

// Upload-type tools get an extra privacy FAQ ("are my files sent to a server?").
function isUploadTool(slug: string): boolean {
  const t = getToolBySlug(slug)
  if (!t) return false
  if (NO_UPLOAD.has(slug)) return false
  return ['image', 'pdf', 'video', 'audio'].includes(t.category) || (t.maxFileSizeMB?.free ?? 0) > 0
}

interface FaqItem {
  q: string
  a: string
}
interface FaqData {
  intro?: string
  faq?: FaqItem[]
}

// True for the generic "is it free?" question in any locale — used to drop the
// per-tool free item so it isn't duplicated with the canonical one.
function isFreeQuestion(q: string): boolean {
  const s = q.toLowerCase()
  return s.includes('무료') || s.includes('無料') || s.includes('free')
}

/**
 * FAQ block at the bottom of every tool page (rendered by ToolLayout).
 * Every tool gets two canonical items first — "is it free?" and "what is this
 * tool?" (answered from the localized description) — followed by any tool-
 * specific Q&As from `langTools.<slug>`. Emits FAQPage JSON-LD for rich results.
 */
export default function ToolFaq({ slug }: { slug: string }) {
  const lt = useTranslations('langTools')
  const c = useTranslations('faqCommon')
  const td = useTranslations('toolDescriptions')
  const messages = useMessages() as { toolAbout?: Record<string, string> }

  // Per-tool custom data (intro + extra Q&As), if any.
  let data: FaqData | undefined
  try {
    const raw = lt.raw(slug) as unknown
    if (raw && typeof raw === 'object') data = raw as FaqData
  } catch { /* no custom entry */ }

  // Localized description (drives the "what is this tool?" answer).
  let description: string | undefined
  try {
    const raw = td.raw(slug) as unknown
    if (typeof raw === 'string') description = raw
    else if (raw && typeof raw === 'object' && typeof (raw as { description?: string }).description === 'string') {
      description = (raw as { description: string }).description
    }
  } catch { /* no description */ }

  // Prefer a warm, fuller hand-written "about" blurb; otherwise fall back to the
  // SEO description softened with a friendly closing line.
  const about = messages?.toolAbout?.[slug]
  const whatAnswer = about
    ? about
    : description
      ? `${description} ${c('aboutTail')}`
      : data?.intro

  const items: FaqItem[] = [{ q: c('q'), a: c('a') }]
  if (whatAnswer) items.push({ q: c('whatQ'), a: whatAnswer })
  if (isUploadTool(slug)) items.push({ q: c('uploadPrivacyQ'), a: c('uploadPrivacyA') })
  for (const it of data?.faq ?? []) {
    if (!isFreeQuestion(it.q)) items.push(it)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }

  return (
    <section className="max-w-4xl mx-auto px-4 mt-10 text-gray-600">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 className="text-lg font-bold text-gray-900 mb-4">FAQ</h2>
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
