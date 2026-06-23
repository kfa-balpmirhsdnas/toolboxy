'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('due-date-calculator')!

const DAY = 86_400_000

export default function DueDatePage({ params }: { params: { lang: string } }) {
  const [lmp, setLmp] = useState('')
  const [cycle, setCycle] = useState('28')

  const result = (() => {
    if (!lmp) return null
    const start = new Date(lmp).getTime()
    if (isNaN(start)) return null
    const adj = (Number(cycle) || 28) - 28 // cycle-length adjustment
    const due = new Date(start + (280 + adj) * DAY)
    const daysPreg = Math.floor((Date.now() - start) / DAY)
    const weeks = Math.floor(daysPreg / 7)
    const days = daysPreg % 7
    return { due, weeks, days, daysPreg }
  })()

  const fmt = (d: Date) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First day of last menstrual period</label>
          <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Average cycle length (days)</label>
          <input type="number" value={cycle} onChange={(e) => setCycle(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        {result && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <div className="text-sm text-brand-600">Estimated due date</div>
            <div className="text-2xl font-bold text-brand-700 my-1">{fmt(result.due)}</div>
            {result.daysPreg >= 0 && result.daysPreg < 300 && (
              <div className="text-sm text-brand-600">Currently {result.weeks} weeks {result.days} days pregnant</div>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400">Naegele&apos;s rule (280 days) · estimate only, not medical advice.</p>
      </div>

    </ToolLayout>
  )
}
