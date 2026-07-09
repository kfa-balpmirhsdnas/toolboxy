'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { CSS_COLORS, colorSlug } from '@/lib/color-names'

const tool = getToolBySlug('html-color-names')!

export default function HTMLColorNamesPage() {
  const t = useTranslations('toolui')
  const { lang } = useParams<{ lang: string }>()
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')

  const filtered = CSS_COLORS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.hex.toLowerCase().includes(search.toLowerCase())
  )

  const copy = (val: string) => {
    navigator.clipboard.writeText(val)
    setCopied(val)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hcn_title')}</h1>
        <p className="text-gray-500 mb-6">{t('hcn_subtitle')}</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <input type="text" placeholder={t('hcc_ph')}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search} onChange={e => setSearch(e.target.value)} />
          {copied && <p className="text-xs text-center text-green-600 font-medium">{t('hcn_copied',{name:copied})}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map((c) => (
              <div key={c.name}
                className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left group border border-transparent hover:border-gray-200">
                {/* swatch + name/hex link to the per-color page; the icon on the right copies the hex */}
                <Link href={`/${lang}/tools/html-color-names/${colorSlug(c)}`} className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-md border border-gray-200 flex-shrink-0" style={{background: c.hex}} />
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium text-gray-700 truncate group-hover:text-brand-600 group-hover:underline">{c.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.hex}</div>
                  </div>
                </Link>
                <button onClick={() => copy(c.hex)} aria-label={`copy ${c.hex}`} title={c.hex}
                  className="shrink-0 p-1.5 text-gray-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                </button>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8">{t('hcn_none')}</p>}
        </div>
      </div>
    </ToolLayout>
  )
}
