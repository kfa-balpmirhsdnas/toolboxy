'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('exercise-calorie-calculator')!
// [translation key, MET] — MET values from the Compendium of Physical Activities.
const ACTS: [string, number][] = [
  ['walk', 3.5], ['briskwalk', 5.0], ['run8', 8.3], ['run11', 11.0], ['cycle', 7.5], ['swim', 8.0],
  ['jumprope', 12.3], ['hike', 6.0], ['yoga', 2.5], ['weights', 5.0], ['soccer', 7.0], ['basketball', 6.5],
  ['tennis', 7.3], ['badminton', 5.5], ['dance', 5.0], ['stairs', 8.0], ['aerobics', 7.3], ['housework', 3.3],
]

export default function ExerciseCalorieCalculatorPage() {
  const t = useTranslations('toolui')
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [weight, setWeight] = useState(65)
  const [actIdx, setActIdx] = useState(2)
  const [min, setMin] = useState(30)

  const wKg = unit === 'imperial' ? weight * 0.453592 : weight
  const met = ACTS[actIdx][1]
  const perMin = (met * 3.5 * wKg) / 200 // ACSM kcal/min
  const total = Math.round(perMin * Math.max(0, min))
  const rice = total / 300 // a bowl of rice ≈ 300 kcal

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['metric', 'imperial'] as const).map((u) => (
            <button key={u} onClick={() => setUnit(u)}
              className={'flex-1 py-2 text-sm font-medium transition ' + (unit === u ? 'bg-rose-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50')}>{t('ex_' + u)}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">{t('ex_weight')} ({unit === 'metric' ? 'kg' : 'lbs'})</label>
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min="20"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-rose-400" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">{t('ex_duration')} ({t('ex_min')})</label>
            <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} min="1"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-rose-400" /></div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">{t('ex_activity')}</label>
          <select value={actIdx} onChange={(e) => setActIdx(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-rose-400">
            {ACTS.map((a, i) => <option key={i} value={i}>{t('ex_' + a[0])} (MET {a[1]})</option>)}
          </select></div>
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((m) => (
            <button key={m} onClick={() => setMin(m)}
              className={'flex-1 py-1.5 rounded-lg text-xs font-medium transition ' + (min === m ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{m}{t('ex_min')}</button>
          ))}
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100 text-center">
          <p className="text-4xl font-bold text-rose-600">{total.toLocaleString()} <span className="text-lg">kcal</span></p>
          <p className="text-xs text-gray-500 mt-1">{t('ex_permin', { n: perMin.toFixed(1) })}</p>
          <p className="text-xs text-gray-400 mt-2">🍚 {t('ex_rice', { n: rice.toFixed(1) })}</p>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('ex_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
