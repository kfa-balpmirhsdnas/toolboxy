'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('exercise-calorie-calculator')!
// Per-locale "calories equal this many of a familiar food" comparison.
const FOODS: Record<string, { emoji: string; kcal: number }> = {
  ko: { emoji: '🍚', kcal: 300 }, // 공기밥
  en: { emoji: '🍎', kcal: 95 },  // apple
  ja: { emoji: '🍙', kcal: 190 }, // おにぎり
}

// Emoji per activity for the dropdown (an <option> can't hold an SVG like the presets do).
const ACT_EMOJI: Record<string, string> = {
  walk: '🚶', briskwalk: '🚶', run8: '🏃', run11: '🏃', cycle: '🚴', swim: '🏊',
  jumprope: '🤸', hike: '🥾', yoga: '🧘', weights: '🏋️', soccer: '⚽', basketball: '🏀',
  tennis: '🎾', badminton: '🏸', dance: '💃', stairs: '🪜', aerobics: '🤸', housework: '🧹',
}
// [translation key, MET] — MET values from the Compendium of Physical Activities.
const ACTS: [string, number][] = [
  ['walk', 3.5], ['briskwalk', 5.0], ['run8', 8.3], ['run11', 11.0], ['cycle', 7.5], ['swim', 8.0],
  ['jumprope', 12.3], ['hike', 6.0], ['yoga', 2.5], ['weights', 5.0], ['soccer', 7.0], ['basketball', 6.5],
  ['tennis', 7.3], ['badminton', 5.5], ['dance', 5.0], ['stairs', 8.0], ['aerobics', 7.3], ['housework', 3.3],
]

export default function ExerciseCalorieCalculatorPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [weight, setWeight] = useState(65)
  const [actIdx, setActIdx] = useState(2)
  const [min, setMin] = useState(30)

  const wKg = unit === 'imperial' ? weight * 0.453592 : weight
  const met = ACTS[actIdx][1]
  const perMin = (met * 3.5 * wKg) / 200 // ACSM kcal/min
  const total = Math.round(perMin * Math.max(0, min))
  const food = FOODS[locale] ?? FOODS.en
  const foodCount = total / food.kcal

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['metric', 'imperial'] as const).map((u) => (
            <button key={u} onClick={() => { if (u === unit) return; setWeight(Math.round(u === 'imperial' ? weight * 2.20462 : weight * 0.453592)); setUnit(u) }}
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
            {ACTS.map((a, i) => <option key={i} value={i}>{ACT_EMOJI[a[0]]} {t('ex_' + a[0])}</option>)}
          </select></div>
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((m) => (
            <button key={m} onClick={() => setMin(m)}
              className={'flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition ' + (min === m ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
              <span className="text-sm">{ACT_EMOJI[ACTS[actIdx][0]]}</span> {m}{t('ex_min')}
            </button>
          ))}
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100 text-center">
          <p className="text-4xl font-bold text-rose-600">{total.toLocaleString()} <span className="text-lg">kcal</span></p>
          <p className="text-2xl font-light text-gray-300 leading-none my-1">≈</p>
          <p className="font-bold text-gray-800 leading-tight"><span className="text-3xl align-middle">{food.emoji}</span> <span className="text-xl align-middle">{t('ex_food', { n: foodCount.toFixed(1) })}</span></p>
          <p className="text-xs text-gray-400 mt-2">({t('ex_permin', { n: perMin.toFixed(1) })})</p>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('ex_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
