'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('bmi-calculator')!
function bmiCat(bmi: number): { k: string; color: string; d: string } {
  if (bmi < 18.5) return { k: 'under', color: 'text-blue-600', d: 'BMI < 18.5' }
  if (bmi < 25) return { k: 'normal', color: 'text-green-600', d: 'BMI 18.5–24.9' }
  if (bmi < 30) return { k: 'over', color: 'text-yellow-600', d: 'BMI 25–29.9' }
  if (bmi < 35) return { k: 'obese1', color: 'text-orange-600', d: 'BMI 30–34.9' }
  if (bmi < 40) return { k: 'obese2', color: 'text-red-600', d: 'BMI 35–39.9' }
  return { k: 'obese3', color: 'text-red-800', d: 'BMI ≥ 40' }
}
export default function BmiCalculatorPage() {
  const t = useTranslations('toolui')
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [height, setHeight] = useState(170)
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(7)
  const [weight, setWeight] = useState(70)
  const [weightLb, setWeightLb] = useState(154)
  const heightM = unit === 'metric' ? height / 100 : (heightFt * 12 + heightIn) * 0.0254
  const weightKg = unit === 'metric' ? weight : weightLb * 0.453592
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1))
  const { k, color, d } = bmiCat(bmi)
  const idealMin = parseFloat((18.5 * heightM * heightM).toFixed(1))
  const idealMax = parseFloat((24.9 * heightM * heightM).toFixed(1))
  const pct = Math.min(100, Math.max(0, (bmi - 15) / 25 * 100))
  const RANGES = [{ max: 18.5, color: 'bg-blue-400' }, { max: 25, color: 'bg-green-400' }, { max: 30, color: 'bg-yellow-400' }, { max: 35, color: 'bg-orange-400' }, { max: 40, color: 'bg-red-500' }]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={() => setUnit('metric')} className={'flex-1 py-2 text-sm font-medium transition ' + (unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50')}>{t('bmi_metric')}</button>
          <button onClick={() => setUnit('imperial')} className={'flex-1 py-2 text-sm font-medium transition ' + (unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50')}>{t('bmi_imperial')}</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {unit === 'metric' ? (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('bmi_height')} (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2.5 text-xl font-mono text-center" min="50" max="300" /></div>
          ) : (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('bmi_height')}</label>
              <div className="flex gap-1.5">
                <input type="number" value={heightFt} onChange={e => setHeightFt(Number(e.target.value))} className="w-14 rounded border border-gray-300 px-2 py-2.5 text-lg font-mono text-center" min="1" max="9" />
                <span className="self-end pb-2.5 text-gray-500 text-sm">ft</span>
                <input type="number" value={heightIn} onChange={e => setHeightIn(Number(e.target.value))} className="w-14 rounded border border-gray-300 px-2 py-2.5 text-lg font-mono text-center" min="0" max="11" />
                <span className="self-end pb-2.5 text-gray-500 text-sm">in</span>
              </div>
            </div>
          )}
          {unit === 'metric' ? (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('bmi_weight')} (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2.5 text-xl font-mono text-center" min="1" max="500" /></div>
          ) : (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('bmi_weight')} (lb)</label>
              <input type="number" value={weightLb} onChange={e => setWeightLb(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2.5 text-xl font-mono text-center" min="1" max="1100" /></div>
          )}
        </div>
        <div className="text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
          <p className="text-6xl font-bold text-gray-800 font-mono">{bmi || '—'}</p>
          <p className={'text-xl font-semibold mt-1 ' + color}>{t('bmi_' + k)}</p>
          <p className="text-xs text-gray-500 mt-1">{d}</p>
        </div>
        <div className="space-y-1">
          <div className="flex rounded-full overflow-hidden h-4">
            {RANGES.map((r, i, arr) => (
              <div key={r.max} className={'flex-1 ' + r.color} style={{ flex: ((r.max - (arr[i - 1]?.max || 15)) / (40 - 15)) }} />
            ))}
          </div>
          <div className="relative h-3">
            <div className="absolute w-2 h-3 bg-gray-800 rounded-sm" style={{ left: pct + '%', transform: 'translateX(-50%)' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-mono">
            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <p className="font-medium text-gray-700 mb-1">{t('bmi_ideal')}</p>
          <p className="text-gray-600">{t('bmi_for_height')} <span className="font-semibold text-green-600">{idealMin} – {idealMax} kg</span>{unit === 'imperial' && <span className="text-gray-400"> ({(idealMin * 2.20462).toFixed(1)} – {(idealMax * 2.20462).toFixed(1)} lb)</span>}</p>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('bmi_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
