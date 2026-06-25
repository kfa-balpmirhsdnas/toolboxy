'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, flag, cName } from '@/lib/countries'
import { EXTRA, plugName } from '@/lib/country-extra'

const tool = getToolBySlug('plug-type')!

export default function PlugTypePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const sorted = useMemo(() => [...COUNTRIES].sort((a, b) => cName(a, lang).localeCompare(cName(b, lang))), [lang])
  const [code, setCode] = useState('JP')
  const c = COUNTRIES.find((x) => x.code === code)!
  const e = EXTRA[code]
  // compatibility hint vs Korea (C/F, 220V)
  const krPlugs = EXTRA.KR.plugs
  const sharePlug = e.plugs.some((p) => krPlugs.includes(p))
  const sameVolt = e.volt === EXTRA.KR.volt

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pt2_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('pt2_subtitle')}</p>
        </div>

        <div className="text-center space-y-2">
          <div className="text-6xl">{flag(c.code)}</div>
          <select value={code} onChange={(e) => setCode(e.target.value)} className="w-full max-w-xs mx-auto rounded-xl border border-gray-200 px-3 py-2.5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-brand-400">
            {sorted.map((x) => <option key={x.code} value={x.code}>{cName(x, lang)}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {e.plugs.map((p) => (
            <div key={p} className="rounded-xl border-2 border-gray-100 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 font-bold text-xl flex items-center justify-center">{p}</div>
              <span className="text-sm text-gray-700">{plugName(p, lang)}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm">
          <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('pt2_plugs')}</span><span className="font-bold text-gray-800">{e.plugs.join(' · ')}</span></div>
          <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('pt2_voltage')}</span><span className="font-medium text-gray-800">{e.volt}</span></div>
          <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('pt2_freq')}</span><span className="font-medium text-gray-800">{e.freq}</span></div>
        </div>

        {code !== 'KR' && (
          <div className={`rounded-xl px-4 py-3 text-sm ${sharePlug && sameVolt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {sharePlug ? t('pt2_plug_ok') : t('pt2_plug_need')}{' · '}{sameVolt ? t('pt2_volt_ok') : t('pt2_volt_diff', { v: e.volt })}
          </div>
        )}
        <p className="text-xs text-gray-400">{t('pt2_note')}</p>
      </div>
    </ToolLayout>
  )
}
