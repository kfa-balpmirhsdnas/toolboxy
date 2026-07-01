'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, flag, cName, capName, regionName, type Country } from '@/lib/countries'
import { EXTRA } from '@/lib/country-extra'

const tool = getToolBySlug('country-compare')!

export default function CountryComparePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const sorted = useMemo(() => [...COUNTRIES].sort((a, b) => cName(a, lang).localeCompare(cName(b, lang))), [lang])
  const [a, setA] = useState('KR')
  const [b, setB] = useState('JP')
  const ca = COUNTRIES.find((c) => c.code === a)!
  const cb = COUNTRIES.find((c) => c.code === b)!

  const Sel = ({ val, set }: { val: string; set: (v: string) => void }) => (
    <select value={val} onChange={(e) => set(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-brand-400">
      {sorted.map((c) => <option key={c.code} value={c.code}>{cName(c, lang)}</option>)}
    </select>
  )
  const rows: [string, (c: Country) => string][] = [
    ['cmp_capital', (c) => capName(c, lang)],
    ['cmp_region', (c) => regionName(c.region, lang)],
    ['cmp_dial', (c) => c.dial],
    ['cmp_pop', (c) => c.pop.toLocaleString()],
    ['cmp_plug', (c) => EXTRA[c.code] ? EXTRA[c.code].plugs.join(' · ') : '—'],
    ['cmp_volt', (c) => EXTRA[c.code] ? `${EXTRA[c.code].volt} · ${EXTRA[c.code].freq}` : '—'],
  ]

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cmp_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cmp_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 text-center"><div className="text-5xl">{flag(ca.code)}</div><Sel val={a} set={setA} /></div>
          <div className="space-y-2 text-center"><div className="text-5xl">{flag(cb.code)}</div><Sel val={b} set={setB} /></div>
        </div>

        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {rows.map(([key, get]) => (
            <div key={key} className="px-2 py-2">
              <div className="text-center text-[11px] text-gray-400">{t(key)}</div>
              <div className="grid grid-cols-2">
                <div className="px-3 py-1 text-sm text-center font-medium text-gray-800 border-r border-gray-100">{get(ca)}</div>
                <div className="px-3 py-1 text-sm text-center font-medium text-gray-800">{get(cb)}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">{t('cmp_note')}</p>
      </div>
    </ToolLayout>
  )
}
