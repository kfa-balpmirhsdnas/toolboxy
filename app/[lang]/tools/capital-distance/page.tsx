'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, flag, cName, capName, haversine } from '@/lib/countries'

const tool = getToolBySlug('capital-distance')!

export default function CapitalDistancePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const sorted = useMemo(() => [...COUNTRIES].sort((a, b) => cName(a, lang).localeCompare(cName(b, lang))), [lang])
  const [a, setA] = useState('KR')
  const [b, setB] = useState('US')
  const ca = COUNTRIES.find((c) => c.code === a)!
  const cb = COUNTRIES.find((c) => c.code === b)!
  const km = haversine(ca, cb)
  const miles = Math.round(km * 0.621371)

  const Sel = ({ val, set }: { val: string; set: (v: string) => void }) => (
    <select value={val} onChange={(e) => set(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-brand-400">
      {sorted.map((c) => <option key={c.code} value={c.code}>{cName(c, lang)} — {capName(c, lang)}</option>)}
    </select>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cd_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cd_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 text-center"><div className="text-5xl">{flag(ca.code)}</div><Sel val={a} set={setA} /></div>
          <div className="space-y-2 text-center"><div className="text-5xl">{flag(cb.code)}</div><Sel val={b} set={setB} /></div>
        </div>

        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
          <div className="text-sm text-gray-500">{capName(ca, lang)} ↔ {capName(cb, lang)}</div>
          <div className="text-5xl font-bold text-brand-700 mt-1 tabular-nums">{km.toLocaleString()} <span className="text-2xl">km</span></div>
          <div className="text-sm text-gray-500 mt-1">{miles.toLocaleString()} {t('cd_miles')}</div>
        </div>
        <p className="text-xs text-gray-400">{t('cd_note')}</p>
      </div>
    </ToolLayout>
  )
}
