'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, flag, cName } from '@/lib/countries'

const tool = getToolBySlug('country-calling-codes')!

export default function CallingCodesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [q, setQ] = useState('')
  const [copied, setCopied] = useState('')
  const query = q.trim().toLowerCase()
  const list = COUNTRIES.filter((c) =>
    !query || c.en.toLowerCase().includes(query) || c.ko.includes(q.trim()) || c.ja.includes(q.trim()) || c.dial.includes(query) || c.code.toLowerCase() === query
  ).sort((a, b) => cName(a, lang).localeCompare(cName(b, lang)))

  function copy(dial: string) {
    navigator.clipboard?.writeText(dial); setCopied(dial); setTimeout(() => setCopied(''), 1200)
  }

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cc_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cc_subtitle')}</p>
        </div>

        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" name="tbx-country" autoFocus
          autoComplete="off" data-1p-ignore data-lpignore="true" placeholder={t('cc_search')}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {list.map((c) => (
            <button key={c.code} onClick={() => copy(c.dial)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left">
              <span className="flex items-center gap-2"><span className="text-xl">{flag(c.code)}</span><span className="text-sm text-gray-700">{cName(c, lang)}</span></span>
              <span className="font-mono font-semibold text-brand-600">{copied === c.dial ? t('cc_copied') : c.dial}</span>
            </button>
          ))}
          {!list.length && <p className="px-4 py-6 text-center text-sm text-gray-400">{t('cc_none')}</p>}
        </div>
        <p className="text-xs text-gray-400">{t('cc_note')}</p>
      </div>
    </ToolLayout>
  )
}
