'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { IDIOMS, searchIdioms } from '@/lib/gosaseongeo'

const tool = getToolBySlug('gosaseongeo')!

export default function GosaseongeoPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [q, setQ] = useState('')
  const [len, setLen] = useState(0)
  const [originOnly, setOriginOnly] = useState(false)

  const list = useMemo(() => {
    let r = searchIdioms(q)
    if (len) r = r.filter((i) => i.len === len)
    if (originOnly) r = r.filter((i) => i.origin)
    return r
  }, [q, len, originOnly])

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('gs_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('gs_subtitle')}</p>
        </div>

        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" name="tbx-gosa" autoFocus
          autoComplete="off" data-1p-ignore data-lpignore="true" placeholder={t('gs_search')}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="flex flex-wrap gap-1.5">
          {[[0, t('gs_all')], [4, '4'], [3, '3'], [2, '2']].map(([v, lbl]) => (
            <button key={v} onClick={() => setLen(v as number)} className={`px-3 py-1 text-sm rounded-full border ${len === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{lbl}{v ? t('gs_charunit') : ''}</button>
          ))}
          <button onClick={() => setOriginOnly((v) => !v)} className={`px-3 py-1 text-sm rounded-full border ${originOnly ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('gs_originonly')}</button>
        </div>

        <p className="text-xs text-gray-400">{t('gs_count', { n: list.length })}</p>

        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {list.map((i) => (
            <Link key={i.id} href={`/${lang}/tools/gosaseongeo/${encodeURIComponent(i.reading)}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
              <span className="text-xl font-bold text-gray-900 shrink-0" style={{ fontFamily: 'serif' }}>{i.hanja}</span>
              <span className="text-sm text-gray-500 shrink-0">{i.reading}</span>
              <span className="text-sm text-gray-700 truncate ml-auto text-right">{i.fig}</span>
            </Link>
          ))}
          {!list.length && <p className="px-4 py-8 text-center text-sm text-gray-400">{t('gs_none')}</p>}
        </div>
        <p className="text-xs text-gray-400">{t('gs_note', { n: IDIOMS.length })}</p>
      </div>
    </ToolLayout>
  )
}
