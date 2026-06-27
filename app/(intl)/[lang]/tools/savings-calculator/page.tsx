'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('savings-calculator')!

export default function SavingsCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const loc = params.lang === 'ja' ? 'ja-JP' : params.lang === 'ko' ? 'ko-KR' : 'en-US'
  const [monthly, setMonthly] = useState('300000')
  const [months, setMonths] = useState('12')
  const [rate, setRate] = useState('3.5')
  const [compound, setCompound] = useState(false)
  const [taxFree, setTaxFree] = useState(false)

  const P = parseFloat(monthly) || 0
  const n = parseInt(months, 10) || 0
  const r = (parseFloat(rate) || 0) / 100
  const i = r / 12
  const principal = P * n
  let interest = 0
  if (compound && i > 0) interest = P * ((Math.pow(1 + i, n) - 1) / i) - principal
  else interest = P * i * (n * (n + 1) / 2) // simple: each deposit earns for its remaining months
  const taxRate = taxFree ? 0 : 0.154
  const tax = Math.round(interest * taxRate)
  const afterTax = Math.round(interest) - tax
  const total = principal + afterTax
  const fmt = (x: number) => Math.round(x).toLocaleString(loc)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sv_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sv_subtitle')}</p>
        </div>

        <div className="space-y-3">
          {([['sv_monthly', monthly, setMonthly], ['sv_months', months, setMonths], ['sv_rate', rate, setRate]] as const).map(([key, val, set]) => (
            <label key={key} className="flex flex-col gap-1 text-sm text-gray-600">{t(key)}
              <input value={val} onChange={(e) => set(e.target.value)} type="search" inputMode="decimal" autoComplete="off" data-1p-ignore data-lpignore="true"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </label>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setCompound(false)} className={`flex-1 py-2 text-sm rounded-xl border-2 ${!compound ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('sv_simple')}</button>
            <button onClick={() => setCompound(true)} className={`flex-1 py-2 text-sm rounded-xl border-2 ${compound ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('sv_compound')}</button>
            <button onClick={() => setTaxFree((v) => !v)} className={`flex-1 py-2 text-sm rounded-xl border-2 ${taxFree ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>{taxFree ? t('sv_tax_free') : t('sv_tax_normal')}</button>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">{t('sv_principal')}</span><span className="font-medium text-gray-700 tabular-nums">{fmt(principal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">{t('sv_interest')}</span><span className="font-medium text-gray-700 tabular-nums">+{fmt(interest)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">{t('sv_taxamt')} {taxFree ? '(0%)' : '(15.4%)'}</span><span className="font-medium text-rose-600 tabular-nums">−{fmt(tax)}</span></div>
          <div className="flex justify-between border-t border-brand-200 pt-2 mt-1"><span className="font-semibold text-gray-700">{t('sv_total')}</span><span className="text-xl font-bold text-brand-700 tabular-nums">{fmt(total)}</span></div>
        </div>
        <p className="text-xs text-gray-400">{t('sv_note')}</p>
      </div>
    </ToolLayout>
  )
}
