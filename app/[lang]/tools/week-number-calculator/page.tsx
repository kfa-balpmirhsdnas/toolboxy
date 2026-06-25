'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('week-number-calculator')!

function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return { week, year: date.getUTCFullYear() }
}

export default function WeekNumberPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const loc = params.lang === 'ja' ? 'ja-JP' : params.lang === 'ko' ? 'ko-KR' : 'en-US'
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const d = new Date(date + 'T00:00:00')
  const ok = !isNaN(d.getTime())

  let week = 0, wyear = 0, weekday = '', range = '', doy = 0
  if (ok) {
    const iso = isoWeek(d); week = iso.week; wyear = iso.year
    weekday = d.toLocaleDateString(loc, { weekday: 'long' })
    const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const f = (x: Date) => x.toLocaleDateString(loc, { month: 'short', day: 'numeric' })
    range = `${f(mon)} ~ ${f(sun)}`
    doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('wn_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('wn_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('wn_date')}
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </label>

        {ok && (
          <>
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
              <div className="text-5xl font-bold text-brand-700">{t('wn_weeklabel', { y: wyear, w: week })}</div>
            </div>
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('wn_weekday')}</span><span className="font-medium text-gray-800">{weekday}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('wn_range')}</span><span className="font-medium text-gray-800">{range}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('wn_dayofyear')}</span><span className="font-medium text-gray-800 tabular-nums">{doy}</span></div>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">{t('wn_note')}</p>
      </div>
    </ToolLayout>
  )
}
