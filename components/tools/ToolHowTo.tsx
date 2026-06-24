'use client'

import { useMessages } from 'next-intl'
import type { ToolMeta } from '@/lib/tools/registry'

const ACRONYMS = new Set(['pdf', 'qr', 'json', 'csv', 'svg', 'png', 'jpg', 'heic', 'bmi', 'cps', 'seo', 'url', 'utm', 'rgb', 'hex'])
function slugToName(slug: string): string {
  return slug.split('-').map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
}

type Archetype = 'upload' | 'text' | 'calc' | 'generate' | 'convert' | 'game'

function archetypeOf(tool: ToolMeta): Archetype {
  const s = tool.slug
  if (tool.category === 'game') return 'game'
  if (['image', 'pdf', 'video', 'audio'].includes(tool.category) || (tool.maxFileSizeMB?.free ?? 0) > 0) return 'upload'
  if (tool.category === 'qr' || /generator|generate|builder/.test(s)) return 'generate'
  if (tool.category === 'finance' || tool.category === 'health' || /calculator|-calc$/.test(s)) return 'calc'
  if (/converter|convert|-to-/.test(s)) return 'convert'
  return 'text'
}

interface HowtoMessages {
  howto?: { title?: string } & Record<string, unknown>
  toolNames?: Record<string, string>
}

/**
 * "How to use" steps for every tool, chosen by tool archetype and localized.
 * Reads messages directly (no useTranslations) so a missing key can never throw
 * during static generation. Adds HowTo JSON-LD (valid + harmless; Google has
 * largely retired HowTo rich results, so the visible steps are the real value).
 */
export default function ToolHowTo({ tool }: { tool: ToolMeta }) {
  const messages = useMessages() as HowtoMessages
  const howto = messages?.howto
  const title = howto?.title || 'How to use'
  const raw = howto ? howto[archetypeOf(tool)] : undefined
  const steps = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
  if (steps.length === 0) return null

  const name = messages?.toolNames?.[tool.slug] ?? slugToName(tool.slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${title} — ${name}`,
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s, text: s })),
  }

  return (
    <section className="max-w-4xl mx-auto px-4 mt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center">{i + 1}</span>
            <p className="text-sm text-gray-600 leading-relaxed pt-0.5">{s}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
