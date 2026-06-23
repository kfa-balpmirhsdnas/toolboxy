'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('ovulation-calculator')!

const DAY = 86_400_000

export default function OvulationPage({ params }: { params: { lang: string } }) {
  const [lmp, setLmp] = useState('')
  const [cycle, setCycle] = useState('28')

  const result = (() => {
    if (!lmp) return null
    const start = new Date(lmp).getTime()
    if (isNaN(start)) return null
    const len = Number(cycle) || 28
    const ovulation = new Date(start + (len - 14) * DAY)
    const fertileStart = new Date(ovulation.getTime() - 5 * DAY)
    const fertileEnd = new Date(ovulation.getTime() + 1 * DAY)
    const nextPeriod = new Date(start + len * DAY)
    return { ovulation, fertileStart, fertileEnd, nextPeriod }
  })()

  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First day of last period</label>
          <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cycle length (days)</label>
          <input type="number" value={cycle} onChange={(e) => setCycle(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        {result && (
          <div className="space-y-2">
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
              <div className="text-sm text-brand-600">Estimated ovulation</div>
              <div className="text-2xl font-bold text-brand-700">{fmt(result.ovulation)}</div>
            </div>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-600">Fertile window</span><span className="font-semibold text-gray-900">{fmt(result.fertileStart)} – {fmt(result.fertileEnd)}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-600">Next period</span><span className="font-semibold text-gray-900">{fmt(result.nextPeriod)}</span></div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400">Calendar estimate · not a contraceptive method, not medical advice.</p>
      </div>

      <ToolFaq slug="ovulation-calculator" />
    </ToolLayout>
  )
}
