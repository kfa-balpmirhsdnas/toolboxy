'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('schema-markup-generator')!

type SchemaType = 'Organization' | 'Article' | 'Product' | 'FAQPage'

export default function SchemaMarkupPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [type, setType] = useState<SchemaType>('Organization')
  const [f, setF] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }))

  const FIELDS: Record<SchemaType, [string, string][]> = {
    Organization: [['name', 'Organization name'], ['url', 'https://example.com'], ['logo', 'https://example.com/logo.png']],
    Article: [['headline', 'Article title'], ['author', 'Author name'], ['datePublished', '2026-01-01'], ['image', 'https://example.com/img.jpg']],
    Product: [['name', 'Product name'], ['image', 'https://example.com/p.jpg'], ['price', '19.99'], ['priceCurrency', 'USD']],
    FAQPage: [['q1', 'Question 1'], ['a1', 'Answer 1'], ['q2', 'Question 2'], ['a2', 'Answer 2']],
  }

  const obj = (() => {
    const base: Record<string, unknown> = { '@context': 'https://schema.org', '@type': type }
    if (type === 'Product') {
      base.name = f.name || ''
      base.image = f.image || ''
      base.offers = { '@type': 'Offer', price: f.price || '', priceCurrency: f.priceCurrency || 'USD' }
    } else if (type === 'FAQPage') {
      base.mainEntity = [
        { '@type': 'Question', name: f.q1 || '', acceptedAnswer: { '@type': 'Answer', text: f.a1 || '' } },
        { '@type': 'Question', name: f.q2 || '', acceptedAnswer: { '@type': 'Answer', text: f.a2 || '' } },
      ]
    } else {
      for (const [k] of FIELDS[type]) base[k] = f[k] || ''
    }
    return base
  })()

  const output = `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('schema-markup-generator')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['Organization', 'Article', 'Product', 'FAQPage'] as SchemaType[]).map((st) => (
            <button key={st} onClick={() => { setType(st); setF({}) }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                type === st ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{st}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS[type].map(([k, ph]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{k}</label>
              <input value={f[k] || ''} onChange={set(k)} placeholder={ph}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
        </div>

        <div className="relative">
          <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-80">{output}</pre>
          <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ '+t('ui_copied') : t('ui_copy')}</button>
        </div>
      </div>

    </ToolLayout>
  )
}
