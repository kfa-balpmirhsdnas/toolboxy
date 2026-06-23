'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('salary-converter')!

export default function SalaryConverterPage({ params }: { params: { lang: string } }) {
  const [amount, setAmount] = useState('25')
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'month' | 'year'>('hour')
  const [hpw, setHpw] = useState('40')
  const [dpw, setDpw] = useState('5')

  const result = (() => {
    const v = +amount, hours = +hpw || 40, days = +dpw || 5
    if (!(v >= 0)) return null
    const weeksPerYear = 52
    // normalize everything to an hourly rate
    const hourly = period === 'hour' ? v
      : period === 'day' ? v / (hours / days)
      : period === 'week' ? v / hours
      : period === 'month' ? v / (hours * weeksPerYear / 12)
      : v / (hours * weeksPerYear)
    return {
      hour: hourly,
      day: hourly * (hours / days),
      week: hourly * hours,
      month: hourly * hours * weeksPerYear / 12,
      year: hourly * hours * weeksPerYear,
    }
  })()

  const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              {['hour', 'day', 'week', 'month', 'year'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours / week</label>
            <input type="number" value={hpw} onChange={(e) => setHpw(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days / week</label>
            <input type="number" value={dpw} onChange={(e) => setDpw(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>

        {result && (
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 text-sm">
            {(['hour', 'day', 'week', 'month', 'year'] as const).map((p) => (
              <div key={p} className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600 capitalize">Per {p}</span>
                <span className="font-semibold text-gray-900">{money(result[p])}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">Gross pay conversion (before tax) · based on {hpw || 40}h/week, 52 weeks/year.</p>
      </div>

      <ToolFaq slug="salary-converter" />
    </ToolLayout>
  )
}
