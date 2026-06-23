'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('body-fat-calculator')!

// US Navy body-fat method (metric, cm).
function bodyFat(sex: 'male' | 'female', h: number, neck: number, waist: number, hip: number): number | null {
  const log = Math.log10
  try {
    if (sex === 'male') {
      if (waist - neck <= 0 || h <= 0) return null
      return 495 / (1.0324 - 0.19077 * log(waist - neck) + 0.15456 * log(h)) - 450
    }
    if (waist + hip - neck <= 0 || h <= 0) return null
    return 495 / (1.29579 - 0.35004 * log(waist + hip - neck) + 0.221 * log(h)) - 450
  } catch {
    return null
  }
}

function category(sex: 'male' | 'female', bf: number): string {
  const t = sex === 'male' ? [6, 14, 18, 25] : [14, 21, 25, 32]
  if (bf < t[0]) return 'Essential'
  if (bf < t[1]) return 'Athletic'
  if (bf < t[2]) return 'Fitness'
  if (bf < t[3]) return 'Average'
  return 'High'
}

export default function BodyFatPage({ params }: { params: { lang: string } }) {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [h, setH] = useState('')
  const [neck, setNeck] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')

  const bf = bodyFat(sex, +h, +neck, +waist, +hip)
  const valid = bf !== null && isFinite(bf) && bf > 0 && bf < 70

  const num = (label: string, v: string, set: (s: string) => void) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="number" value={v} onChange={(e) => set(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )

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
        <div className="grid grid-cols-2 gap-3">
          {num('Height (cm)', h, setH)}
          {num('Neck (cm)', neck, setNeck)}
          {num('Waist (cm)', waist, setWaist)}
          {sex === 'female' && num('Hip (cm)', hip, setHip)}
        </div>

        {valid && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-brand-700">{bf!.toFixed(1)}%</div>
            <div className="text-sm text-brand-600 mt-1">Body fat · {category(sex, bf!)}</div>
          </div>
        )}
        <p className="text-xs text-gray-400">US Navy circumference method · estimate only, not medical advice.</p>
      </div>

      <ToolFaq slug="body-fat-calculator" />
    </ToolLayout>
  )
}
