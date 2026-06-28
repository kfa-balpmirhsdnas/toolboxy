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

// A small SVG icon per activity (related activities share one), shown on the presets.
const ICON_OF: Record<string, string> = {
  walk: 'person', briskwalk: 'person', run8: 'run', run11: 'run', cycle: 'cycle', swim: 'swim',
  jumprope: 'run', hike: 'hike', yoga: 'person', weights: 'weights', soccer: 'ball', basketball: 'ball',
  tennis: 'ball', badminton: 'ball', dance: 'run', stairs: 'person', aerobics: 'run', housework: 'person',
}
function ActIcon({ act }: { act: string }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const ICONS: Record<string, React.ReactNode> = {
    person: <g {...c}><circle cx="12" cy="4" r="2" fill="currentColor" stroke="none" /><path d="M12 7v6" /><path d="M8 9h8" /><path d="M12 13l-3 7" /><path d="M12 13l3 7" /></g>,
    run: <g {...c}><circle cx="14" cy="4" r="2" fill="currentColor" stroke="none" /><path d="M14 7l-3 4 3 3 1 6" /><path d="M11 11l-4 2" /><path d="M14 10l4 1" /></g>,
    cycle: <g {...c}><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M5.5 17.5l5-8h4" /><path d="M14.5 9.5l4 8" /><path d="M9 9.5h3.5" /></g>,
    swim: <g {...c}><path d="M2 15c1.5 0 1.5 1.5 3 1.5s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5" /><path d="M2 19c1.5 0 1.5 1.5 3 1.5s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5" /><circle cx="16" cy="6" r="2" /></g>,
    weights: <g {...c}><path d="M4 9v6" /><path d="M7 7v10" /><path d="M17 7v10" /><path d="M20 9v6" /><path d="M7 12h10" /></g>,
    ball: <g {...c}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18" /></g>,
    hike: <g {...c}><path d="M3 20l5-9 3 4 2-3 8 8z" /></g>,
  }
  return <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">{ICONS[ICON_OF[act] || 'person']}</svg>
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
              className={'flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition ' + (min === m ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
              <ActIcon act={ACTS[actIdx][0]} />{m}{t('ex_min')}
            </button>
          ))}
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100 text-center">
          <p className="text-4xl font-bold text-rose-600">{total.toLocaleString()} <span className="text-lg">kcal</span></p>
          <p className="text-2xl font-light text-gray-300 leading-none my-1">=</p>
          <p className="font-bold text-gray-800 leading-tight"><span className="text-3xl align-middle">{food.emoji}</span> <span className="text-xl align-middle">{t('ex_food', { n: foodCount.toFixed(1) })}</span></p>
          <p className="text-xs text-gray-400 mt-2">({t('ex_permin', { n: perMin.toFixed(1) })})</p>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('ex_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
