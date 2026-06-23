'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('savings-goal-calculator')!

export default function SavingsGoalPage({ params }: { params: { lang: string } }) {
  const [goal, setGoal] = useState('10000')
  const [initial, setInitial] = useState('1000')
  const [monthly, setMonthly] = useState('300')
  const [rate, setRate] = useState('4')

  const result = (() => {
    const target = +goal, P0 = +initial, pmt = +monthly, i = +rate / 100 / 12
    if (!(target > 0)) return null
    if (P0 >= target) return { months: 0, reached: true }
    let bal = P0
    for (let m = 1; m <= 1200; m++) {
      bal = bal * (1 + i) + pmt
      if (bal >= target) return { months: m, reached: true, final: bal }
    }
    return { months: null, reached: false }
  })()

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
          {field('Savings goal', goal, setGoal)}
          {field('Starting amount', initial, setInitial)}
          {field('Monthly deposit', monthly, setMonthly)}
          {field('Annual return (%)', rate, setRate)}
        </div>

        {result && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            {result.reached && result.months === 0 ? (
              <div className="text-brand-700 font-semibold">You&apos;ve already reached your goal! 🎉</div>
            ) : result.reached && result.months ? (
              <>
                <div className="text-sm text-brand-600">Time to reach your goal</div>
                <div className="text-3xl font-bold text-brand-700 my-1">
                  {Math.floor(result.months / 12)}y {result.months % 12}m
                </div>
                <div className="text-xs text-brand-600">{result.months} months</div>
              </>
            ) : (
              <div className="text-gray-600 text-sm">Not reachable within 100 years — increase your monthly deposit.</div>
            )}
          </div>
        )}
      </div>

    </ToolLayout>
  )
}
