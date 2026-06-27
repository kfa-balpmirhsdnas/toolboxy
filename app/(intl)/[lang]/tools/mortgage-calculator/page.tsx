'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('mortgage-calculator')!

export default function MortgageCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [amount, setAmount] = useState('300000')
  const [rate, setRate] = useState('6')
  const [years, setYears] = useState('30')

  const result = (() => {
    const P = +amount, annual = +rate / 100, n = +years * 12
    if (!(P > 0 && n > 0)) return null
    const r = annual / 12
    const monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const total = monthly * n
    return { monthly, total, interest: total - P }
  })()

  const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const field = (label: string, v: string, set: (s: string) => void, suffix?: string) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" value={v} onChange={(e) => set(e.target.value)}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {field(t('al_amount'), amount, setAmount)}
          {field(t('al_rate'), rate, setRate, '%')}
          {field(t('al_term'), years, setYears, 'yr')}
        </div>
        {result && (
          <div className="space-y-2">
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-5 text-center">
              <div className="text-sm text-brand-600">{t('al_monthly')}</div>
              <div className="text-3xl font-bold text-brand-700">{money(result.monthly)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">{t('al_tinterest')}</div><div className="font-semibold text-gray-900">{money(result.interest)}</div></div>
              <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">{t('al_tpaid')}</div><div className="font-semibold text-gray-900">{money(result.total)}</div></div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('al_disclaimer')}</p>
      </div>

    </ToolLayout>
  )
}
