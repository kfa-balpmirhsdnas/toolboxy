'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('inflation-calculator')!

export default function InflationCalculatorPage({ params }: { params: { lang: string } }) {
  const [amount, setAmount] = useState('10000')
  const [years, setYears] = useState('10')
  const [rate, setRate] = useState('3')

  const result = (() => {
    const a = +amount, y = +years, r = +rate / 100
    if (!(a > 0 && y > 0)) return null
    return { futureCost: a * Math.pow(1 + r, y), power: a / Math.pow(1 + r, y) }
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {field('Amount today', amount, setAmount)}
          {field('Years', years, setYears)}
          {field('Inflation rate (%)', rate, setRate)}
        </div>
        {result && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-5 text-center">
              <div className="text-sm text-brand-600">Cost in the future</div>
              <div className="text-2xl font-bold text-brand-700">{money(result.futureCost)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
              <div className="text-sm text-gray-500">Future purchasing power</div>
              <div className="text-2xl font-bold text-gray-900">{money(result.power)}</div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">Estimate only, not financial advice.</p>
      </div>

      <ToolFaq slug="inflation-calculator" />
    </ToolLayout>
  )
}
