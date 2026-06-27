'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('utm-builder')!

export default function UtmBuilderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [base, setBase] = useState('')
  const [src, setSrc] = useState('')
  const [medium, setMedium] = useState('')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  const output = (() => {
    if (!base.trim()) return ''
    const q = new URLSearchParams()
    if (src) q.set('utm_source', src)
    if (medium) q.set('utm_medium', medium)
    if (campaign) q.set('utm_campaign', campaign)
    if (term) q.set('utm_term', term)
    if (content) q.set('utm_content', content)
    const qs = q.toString()
    const sep = base.includes('?') ? '&' : '?'
    return qs ? `${base.trim()}${sep}${qs}` : base.trim()
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('utm-builder')
    setTimeout(() => setCopied(false), 1500)
  }

  const field = (label: string, v: string, set: (s: string) => void, ph: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t(label)}</label>
      <input value={v} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        {field('utm_url', base, setBase, 'https://example.com/page')}
        <div className="grid grid-cols-2 gap-3">
          {field('utm_source', src, setSrc, 'google, newsletter')}
          {field('utm_medium', medium, setMedium, 'cpc, email, social')}
        </div>
        {field('utm_campaign', campaign, setCampaign, 'spring_sale')}
        <div className="grid grid-cols-2 gap-3">
          {field('utm_term', term, setTerm, 'keyword')}
          {field('utm_content', content, setContent, 'banner_a')}
        </div>

        {output && (
          <div className="relative">
            <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-brand-700 break-all">{output}</div>
            <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ '+t('ui_copied') : t('ui_copy')}</button>
          </div>
        )}
      </div>

    </ToolLayout>
  )
}
