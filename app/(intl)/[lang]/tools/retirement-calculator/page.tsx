'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('retirement-calculator')!

export default function RetirementCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [age, setAge] = useState('30')
  const [retire, setRetire] = useState('65')
  const [savings, setSavings] = useState('20000')
  const [monthly, setMonthly] = useState('500')
  const [ret, setRet] = useState('6')

  const result = (() => {
    const years = +retire - +age
    if (!(years > 0)) return null
    const i = +ret / 100 / 12, N = years * 12, P = +savings, pmt = +monthly
    const fv = P * Math.pow(1 + i, N) + (i > 0 ? pmt * ((Math.pow(1 + i, N) - 1) / i) : pmt * N)
    const contributed = P + pmt * N
    return { fv, contributed, growth: fv - contributed }
  })()

  const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const field = (label: string, v: string, set: (s: string) => void) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type="number" value={v} onChange={(e) => set(e.target.value)}
        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {field(t('rc_age'), age, setAge)}
          {field(t('rc_retire'), retire, setRetire)}
          {field(t('rc_savings'), savings, setSavings)}
          {field(t('rc_monthly'), monthly, setMonthly)}
          {field(t('sg_return'), ret, setRet)}
        </div>
        {result && (
          <div className="space-y-2">
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-5 text-center">
              <div className="text-sm text-brand-600">{t('rc_fv')}</div>
              <div className="text-3xl font-bold text-brand-700">{money(result.fv)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">{t('inv_contributed')}</div><div className="font-semibold text-gray-900">{money(result.contributed)}</div></div>
              <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">{t('rc_growth')}</div><div className="font-semibold text-green-700">{money(result.growth)}</div></div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('al_disclaimer')}</p>
      </div>

    </ToolLayout>
  )
}
