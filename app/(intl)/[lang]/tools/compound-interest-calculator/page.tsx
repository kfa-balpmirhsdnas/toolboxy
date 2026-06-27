'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('compound-interest-calculator')!

const FREQ: Record<string, number> = { Annually: 1, 'Semi-annually': 2, Quarterly: 4, Monthly: 12, Daily: 365 }
const FREQ_K: Record<string, string> = { Annually: 'inv_annually', 'Semi-annually': 'ci_f_semi', Quarterly: 'inv_quarterly', Monthly: 'inv_monthlyf', Daily: 'inv_daily' }

export default function CompoundInterestPage({ params }: { params: { lang: string } }) {
  const tr = useTranslations('toolui')
  const [principal, setPrincipal] = useState('1000')
  const [rate, setRate] = useState('5')
  const [years, setYears] = useState('10')
  const [freq, setFreq] = useState('Monthly')
  const [contrib, setContrib] = useState('0')

  const result = (() => {
    const P = +principal, r = +rate / 100, t = +years, n = FREQ[freq], pmt = +contrib
    if (!(P >= 0 && r >= 0 && t > 0 && n > 0)) return null
    const i = r / n
    const N = n * t
    const fvPrincipal = P * Math.pow(1 + i, N)
    const fvContrib = i > 0 ? pmt * ((Math.pow(1 + i, N) - 1) / i) : pmt * N
    const total = fvPrincipal + fvContrib
    const invested = P + pmt * N
    return { total, invested, interest: total - invested }
  })()

  const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

  const field = (label: string, v: string, set: (s: string) => void) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="number" value={v} onChange={(e) => set(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {field(tr('ci_initial'), principal, setPrincipal)}
          {field(tr('ci_rate'), rate, setRate)}
          {field(tr('ci_years'), years, setYears)}
          {field(tr('ci_contrib'), contrib, setContrib)}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tr('inv_freq')}</label>
          <select value={freq} onChange={(e) => setFreq(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            {Object.keys(FREQ).map((f) => <option key={f} value={f}>{tr(FREQ_K[f])}</option>)}
          </select>
        </div>

        {result && (
          <div className="space-y-2">
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
              <div className="text-sm text-brand-600">{tr('ci_fv')}</div>
              <div className="text-3xl font-bold text-brand-700">{money(result.total)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><div className="text-gray-500 text-xs">{tr('ci_invested')}</div><div className="font-semibold text-gray-900">{money(result.invested)}</div></div>
              <div className="bg-gray-50 rounded-xl p-3"><div className="text-gray-500 text-xs">{tr('ci_earned')}</div><div className="font-semibold text-green-700">{money(result.interest)}</div></div>
            </div>
          </div>
        )}
      </div>

    </ToolLayout>
  )
}
