'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { BODIES, bodyName } from '@/lib/planets'

const tool = getToolBySlug('age-on-other-planets')!
const EMOJI: Record<string, string> = { mercury: '☿️', venus: '♀️', earth: '🌍', mars: '🔴', jupiter: '🪐', saturn: '🪐', uranus: '🔵', neptune: '🔵', pluto: '🌑' }
const PLANETS = BODIES.filter((b) => b.year > 0)

export default function PlanetAge({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [birth, setBirth] = useState('2000-01-01')
  const d = new Date(birth)
  const ok = !isNaN(d.getTime()) && d.getTime() <= Date.now()
  const days = ok ? (Date.now() - d.getTime()) / 86400000 : 0

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pa_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('pa_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('pa_birthdate')}
          <input value={birth} onChange={(e) => setBirth(e.target.value)} type="date"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </label>

        {ok ? (
          <>
            <p className="text-sm text-gray-500 text-center">{t('pa_days')}: <b className="text-gray-800">{Math.floor(days).toLocaleString()}</b></p>
            <div className="grid grid-cols-2 gap-2">
              {PLANETS.map((b) => (
                <div key={b.key} className={`rounded-xl border-2 p-3 flex items-center justify-between ${b.key === 'earth' ? 'border-brand-300 bg-brand-50' : 'border-gray-100'}`}>
                  <span className="flex items-center gap-2 text-sm text-gray-700"><span className="text-lg">{EMOJI[b.key]}</span>{bodyName(b, lang)}</span>
                  <span className="font-bold text-gray-900 tabular-nums">{(days / b.year).toFixed(1)} <span className="text-xs font-normal text-gray-400">{t('pa_years')}</span></span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-amber-50 text-amber-700 text-sm px-4 py-3">{t('pa_error')}</p>
        )}

        <p className="text-xs text-gray-400">{t('pa_note')}</p>
      </div>
    </ToolLayout>
  )
}
