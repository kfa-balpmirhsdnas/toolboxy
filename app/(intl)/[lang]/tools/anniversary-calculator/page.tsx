'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('anniversary-calculator')!
const DAY_MS = 86400000
const DAY_MILES = [100, 200, 300, 500, 1000, 2000, 3000]
const YEAR_MILES = [1, 2, 3, 5, 10, 20]

export default function AnniversaryPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [start, setStart] = useState('')
  const s = new Date(start + 'T00:00:00')
  const ok = !!start && !isNaN(s.getTime())

  const now = new Date()
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayCount = ok ? Math.floor((today0 - s.getTime()) / DAY_MS) + 1 : 0 // start date = day 1

  const fmt = (d: Date) => d.toLocaleDateString(params.lang === 'ja' ? 'ja-JP' : params.lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })
  const dlabel = (date: Date) => {
    const diff = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - today0) / DAY_MS)
    return diff === 0 ? 'D-DAY' : diff > 0 ? `D-${diff}` : `D+${-diff}`
  }

  type Row = { label: string; date: Date; diff: number }
  const rows: Row[] = ok ? [
    ...DAY_MILES.map((n) => ({ label: t('av_days', { n }), date: new Date(s.getTime() + (n - 1) * DAY_MS) })),
    ...YEAR_MILES.map((y) => { const d = new Date(s); d.setFullYear(s.getFullYear() + y); return { label: t('av_year', { n: y }), date: d } }),
  ].map((r) => ({ ...r, diff: Math.round((new Date(r.date.getFullYear(), r.date.getMonth(), r.date.getDate()).getTime() - today0) / DAY_MS) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()) : []

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('av_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('av_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('av_start')}
          <input value={start} onChange={(e) => setStart(e.target.value)} type="date"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </label>

        {ok && (
          <>
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-6 text-center">
              <div className="text-sm text-rose-600">{t('av_today')}</div>
              <div className="text-5xl font-bold text-rose-600 mt-1">{dayCount > 0 ? dayCount.toLocaleString() : 0}<span className="text-2xl font-medium ml-1">{t('av_dayunit')}</span></div>
            </div>

            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
              {rows.map((r, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${r.diff === 0 ? 'bg-rose-50' : ''}`}>
                  <span className="font-medium text-gray-700 w-16">{r.label}</span>
                  <span className="text-gray-500 flex-1 text-center">{fmt(r.date)}</span>
                  <span className={`font-semibold tabular-nums w-14 text-right ${r.diff > 0 ? 'text-brand-600' : r.diff === 0 ? 'text-rose-600' : 'text-gray-300'}`}>{dlabel(r.date)}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">{t('av_note')}</p>
      </div>
    </ToolLayout>
  )
}
