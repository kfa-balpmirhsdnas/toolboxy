'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('drink-calorie-calculator')!
// [translation key, kcal per 100 ml, typical serving ml]
const DRINKS: [string, number, number][] = [
  ['soju', 115, 360], ['beer', 43, 500], ['makgeolli', 50, 300], ['wine', 83, 150], ['whisky', 250, 45],
  ['vodka', 231, 45], ['champagne', 76, 150], ['sake', 134, 180], ['highball', 50, 355], ['cola', 42, 355],
  ['cider', 40, 355], ['orangejuice', 45, 200], ['latte', 60, 355], ['milk', 63, 200], ['sportsdrink', 25, 500], ['energydrink', 45, 250],
]

export default function DrinkCalorieCalculatorPage() {
  const t = useTranslations('toolui')
  const [idx, setIdx] = useState(0)
  const [ml, setMl] = useState(360)

  const pick = (i: number) => { setIdx(i); setMl(DRINKS[i][2]) }
  const kcal100 = DRINKS[idx][1]
  const total = Math.round((kcal100 * Math.max(0, ml)) / 100)
  const walkMin = Math.round(total / 4) // ~4 kcal/min walking

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-xs text-gray-500 mb-1">{t('dr_drink')}</label>
          <select value={idx} onChange={(e) => pick(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
            {DRINKS.map((d, i) => <option key={i} value={i}>{t('dr_' + d[0])} ({d[1]} kcal/100ml)</option>)}
          </select></div>

        <div><label className="block text-xs text-gray-500 mb-1">{t('dr_amount')} ({t('dr_ml')})</label>
          <input type="number" value={ml} onChange={(e) => setMl(Number(e.target.value))} min="0"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-violet-400" />
        </div>
        <div className="flex gap-2">
          {[50, 200, 355, 500].map((m) => (
            <button key={m} onClick={() => setMl(m)}
              className={'flex-1 py-1.5 rounded-lg text-xs font-medium transition ' + (ml === m ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>{m}ml</button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-5 border border-violet-100 text-center">
          <p className="text-4xl font-bold text-violet-600">{total.toLocaleString()} <span className="text-lg">kcal</span></p>
          <p className="text-xs text-gray-500 mt-1">{t('dr_per100', { n: kcal100 })}</p>
          <p className="text-xs text-gray-400 mt-2">🚶 {t('dr_walk', { n: walkMin })}</p>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('dr_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
