'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, flag, cName } from '@/lib/countries'
import { EXTRA, tzOffsetMin } from '@/lib/country-extra'

const tool = getToolBySlug('time-difference')!

export default function TimeDifferencePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const loc = lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US'
  const sorted = useMemo(() => [...COUNTRIES].sort((a, b) => cName(a, lang).localeCompare(cName(b, lang))), [lang])
  const [a, setA] = useState('KR')
  const [b, setB] = useState('US')
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  const ca = COUNTRIES.find((c) => c.code === a)!, cb = COUNTRIES.find((c) => c.code === b)!
  const tzA = EXTRA[a].tz, tzB = EXTRA[b].tz
  const diffMin = now ? tzOffsetMin(tzB, now) - tzOffsetMin(tzA, now) : 0
  const diffH = diffMin / 60
  const localTime = (tz: string) => (now ? new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: lang === 'en', timeZone: tz }).format(now) : '—')
  const localDate = (tz: string) => (now ? new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric', weekday: 'short', timeZone: tz }).format(now) : '')

  const Sel = ({ val, set }: { val: string; set: (v: string) => void }) => (
    <select value={val} onChange={(e) => set(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-brand-400">
      {sorted.map((c) => <option key={c.code} value={c.code}>{cName(c, lang)}</option>)}
    </select>
  )
  const Clock = ({ c, tz }: { c: typeof ca; tz: string }) => (
    <div className="space-y-2 text-center">
      <div className="text-5xl">{flag(c.code)}</div>
      <Sel val={c.code} set={c.code === a ? setA : setB} />
      <div className="text-2xl font-bold text-gray-900 tabular-nums">{localTime(tz)}</div>
      <div className="text-xs text-gray-400">{localDate(tz)}</div>
    </div>
  )

  const absH = Math.abs(diffH)
  const hh = Math.floor(absH), mm = Math.round((absH - hh) * 60)
  const diffStr = `${hh}${t('td_hour')}${mm ? ` ${mm}${t('td_min')}` : ''}`

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('td_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('td_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Clock c={ca} tz={tzA} />
          <Clock c={cb} tz={tzB} />
        </div>

        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
          {diffMin === 0 ? (
            <div className="text-2xl font-bold text-brand-700">{t('td_same')}</div>
          ) : (
            <>
              <div className="text-4xl font-bold text-brand-700">{diffStr}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t(diffMin > 0 ? 'td_ahead' : 'td_behind', { a: cName(cb, lang), b: cName(ca, lang) })}
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">{t('td_note')}</p>
      </div>
    </ToolLayout>
  )
}
