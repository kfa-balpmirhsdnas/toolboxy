'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('ideal-weight-calculator')!

// Formulas use inches over 5 ft (60 in).
function formulas(sex: 'male' | 'female', heightCm: number) {
  const inches = heightCm / 2.54
  const over = Math.max(0, inches - 60)
  const base = sex === 'male'
    ? { Devine: 50, Robinson: 52, Miller: 56.2, Hamwi: 48 }
    : { Devine: 45.5, Robinson: 49, Miller: 53.1, Hamwi: 45.5 }
  const per = sex === 'male'
    ? { Devine: 2.3, Robinson: 1.9, Miller: 1.41, Hamwi: 2.7 }
    : { Devine: 2.3, Robinson: 1.7, Miller: 1.36, Hamwi: 2.2 }
  return (Object.keys(base) as (keyof typeof base)[]).map((k) => ({
    name: k,
    kg: base[k] + per[k] * over,
  }))
}

export default function IdealWeightPage({ params }: { params: { lang: string } }) {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [h, setH] = useState('')

  const hc = Number(h)
  const rows = hc > 50 && hc < 260 ? formulas(sex, hc) : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['male', 'female'] as const).map((s) => (
            <button key={s} onClick={() => setSex(s)}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg border capitalize transition-colors ${
                sex === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{s}</button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input type="number" value={h} onChange={(e) => setH(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        {rows && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 last:border-0">
                <span className="text-gray-600">{r.name} formula</span>
                <span className="font-semibold text-gray-900">{r.kg.toFixed(1)} kg <span className="text-gray-400 font-normal">/ {(r.kg * 2.20462).toFixed(1)} lb</span></span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">Estimates from common clinical formulas · not medical advice.</p>
      </div>

    </ToolLayout>
  )
}
