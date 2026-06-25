'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('moon-phase-calculator')!
const SYNODIC = 29.530588853
const REF_NEW_JD = 2451550.1 // 2000-01-06 18:14 UTC new moon
const PHASE_KEYS = ['mp_p_new', 'mp_p_waxcres', 'mp_p_first', 'mp_p_waxgib', 'mp_p_full', 'mp_p_wangib', 'mp_p_last', 'mp_p_wancres']

function today(): string { return new Date().toISOString().slice(0, 10) }

// SVG path for the lit (bright) area of a moon of radius r, given phase fraction (0..1)
function litPath(r: number, frac: number): string {
  const cx = r, cy = r
  const xr = Math.cos(2 * Math.PI * frac) * r // signed terminator semi-axis
  const waxing = frac < 0.5
  const s1 = waxing ? 1 : 0
  const cres = xr >= 0
  const s2 = cres ? (waxing ? 0 : 1) : (waxing ? 1 : 0)
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${s1} ${cx} ${cy + r} A ${Math.abs(xr).toFixed(2)} ${r} 0 0 ${s2} ${cx} ${cy - r} Z`
}

export default function MoonPhase({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [date, setDate] = useState(today())
  const d = new Date(date + 'T12:00:00Z')
  const ok = !isNaN(d.getTime())

  let frac = 0, illum = 0, age = 0, idx = 0
  if (ok) {
    const jd = d.getTime() / 86400000 + 2440587.5
    age = (((jd - REF_NEW_JD) % SYNODIC) + SYNODIC) % SYNODIC
    frac = age / SYNODIC
    illum = (1 - Math.cos(2 * Math.PI * frac)) / 2
    idx = Math.round(frac * 8) % 8
  }
  const R = 70

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-sm mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('mp_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('mp_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('mp_date')}
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </label>

        {ok && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-100 bg-gradient-to-b from-slate-900 to-slate-800 py-6">
            <svg viewBox={`0 0 ${2 * R} ${2 * R}`} className="w-40 h-40">
              <circle cx={R} cy={R} r={R} fill="#0b1220" />
              <path d={litPath(R, frac)} fill="#fde68a" />
              <circle cx={R} cy={R} r={R} fill="none" stroke="#334155" strokeWidth="1" />
            </svg>
            <div className="text-center text-white">
              <div className="text-xl font-bold">{t(PHASE_KEYS[idx])}</div>
              <div className="text-xs text-slate-300 mt-1">{t('mp_illum')}: {Math.round(illum * 100)}% · {t('mp_age')}: {age.toFixed(1)}{t('mp_day')}</div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">{t('mp_note')}</p>
      </div>
    </ToolLayout>
  )
}
