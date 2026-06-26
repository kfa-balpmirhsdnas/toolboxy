'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
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
  const th = sex === 'male' ? [6, 14, 18, 25] : [14, 21, 25, 32]
  if (bf < th[0]) return 'essential'
  if (bf < th[1]) return 'athletic'
  if (bf < th[2]) return 'fitness'
  if (bf < th[3]) return 'average'
  return 'high'
}

export default function BodyFatPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
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
              className={`text-sm font-medium px-4 py-1.5 rounded-lg border transition-colors ${
                sex === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{t('cal_'+s)}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {num(t('bmi_height')+' (cm)', h, setH)}
          {num(t('bf_neck'), neck, setNeck)}
          {num(t('bf_waist'), waist, setWaist)}
          {sex === 'female' && num(t('bf_hip'), hip, setHip)}
        </div>

        {valid && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-brand-700">{bf!.toFixed(1)}%</div>
            <div className="text-sm text-brand-600 mt-1">{t('bf_label')} · {t('bf_'+category(sex, bf!))}</div>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('bf_disclaimer')}</p>
      </div>

    </ToolLayout>
  )
}
