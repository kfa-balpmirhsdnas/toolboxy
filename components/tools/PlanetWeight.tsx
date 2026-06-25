'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { BODIES, bodyName } from '@/lib/planets'

const tool = getToolBySlug('planet-weight-calculator')!
const EMOJI: Record<string, string> = { sun: '☀️', mercury: '☿️', venus: '♀️', earth: '🌍', moon: '🌕', mars: '🔴', jupiter: '🪐', saturn: '🪐', uranus: '🔵', neptune: '🔵', pluto: '🌑' }

export default function PlanetWeight({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [w, setW] = useState('60')
  const earth = parseFloat(w)
  const ok = !isNaN(earth) && earth > 0

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pw_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('pw_subtitle')}</p>
        </div>

        <label className="flex items-end gap-2">
          <span className="flex flex-col gap-1 text-sm text-gray-600 flex-1">{t('pw_earth_weight')}
            <input value={w} onChange={(e) => setW(e.target.value)} type="search" inputMode="decimal" autoFocus
              autoComplete="off" data-1p-ignore data-lpignore="true"
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </span>
          <span className="pb-3 text-gray-500">kg</span>
        </label>

        {ok && (
          <div className="grid grid-cols-2 gap-2">
            {BODIES.map((b) => (
              <div key={b.key} className={`rounded-xl border-2 p-3 flex items-center justify-between ${b.key === 'earth' ? 'border-brand-300 bg-brand-50' : 'border-gray-100'}`}>
                <span className="flex items-center gap-2 text-sm text-gray-700"><span className="text-lg">{EMOJI[b.key]}</span>{bodyName(b, lang)}</span>
                <span className="font-bold text-gray-900 tabular-nums">{(earth * b.gravity).toFixed(1)} <span className="text-xs font-normal text-gray-400">kg</span></span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">{t('pw_note')}</p>
      </div>
    </ToolLayout>
  )
}
