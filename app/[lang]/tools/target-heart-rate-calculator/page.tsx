'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('target-heart-rate-calculator')!

const ZONES = [
  { name: 'Warm-up', lo: 0.5, hi: 0.6 },
  { name: 'Fat burn', lo: 0.6, hi: 0.7 },
  { name: 'Aerobic', lo: 0.7, hi: 0.8 },
  { name: 'Anaerobic', lo: 0.8, hi: 0.9 },
  { name: 'Maximum', lo: 0.9, hi: 1.0 },
]

export default function TargetHeartRatePage({ params }: { params: { lang: string } }) {
  const [age, setAge] = useState('')
  const [rest, setRest] = useState('')

  const a = Number(age)
  const max = a > 0 && a < 120 ? 220 - a : null
  const r = Number(rest) || 0
  // Karvonen if resting HR provided, else %max
  const hr = (pct: number) => (r > 0 && max ? Math.round((max - r) * pct + r) : max ? Math.round(max * pct) : 0)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resting HR (optional)</label>
            <input type="number" value={rest} onChange={(e) => setRest(e.target.value)} placeholder="e.g. 60"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>

        {max && (
          <div className="space-y-2">
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
              <span className="text-sm text-brand-600">Max heart rate </span>
              <span className="text-2xl font-bold text-brand-700">{max} bpm</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {ZONES.map((z) => (
                <div key={z.name} className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{z.name} <span className="text-gray-400">({z.lo * 100}–{z.hi * 100}%)</span></span>
                  <span className="font-semibold text-gray-900">{hr(z.lo)}–{hr(z.hi)} bpm</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{r > 0 ? 'Karvonen (heart-rate reserve)' : '% of max HR'} · estimate only.</p>
          </div>
        )}
      </div>

    </ToolLayout>
  )
}
