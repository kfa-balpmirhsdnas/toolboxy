'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('drink-calorie-calculator')!

type Drink = { kcal: number; emoji: string; def: number; servings: { k: string; ml: number }[] }
const DRINKS: Record<string, Drink> = {
  soju: { kcal: 115, emoji: '🍶', def: 360, servings: [{ k: 'glass', ml: 50 }, { k: 'halfbottle', ml: 180 }, { k: 'bottle', ml: 360 }] },
  beer: { kcal: 43, emoji: '🍺', def: 355, servings: [{ k: 'glass', ml: 200 }, { k: 'can', ml: 355 }, { k: 'bottle', ml: 500 }] },
  makgeolli: { kcal: 50, emoji: '🥣', def: 300, servings: [{ k: 'bowl', ml: 300 }, { k: 'bottle', ml: 750 }] },
  wine: { kcal: 83, emoji: '🍷', def: 150, servings: [{ k: 'glass', ml: 150 }, { k: 'bottle', ml: 750 }] },
  whisky: { kcal: 250, emoji: '🥃', def: 45, servings: [{ k: 'shot', ml: 45 }, { k: 'glass', ml: 90 }] },
  vodka: { kcal: 231, emoji: '🥃', def: 45, servings: [{ k: 'shot', ml: 45 }, { k: 'glass', ml: 90 }] },
  champagne: { kcal: 76, emoji: '🍾', def: 150, servings: [{ k: 'glass', ml: 150 }, { k: 'bottle', ml: 750 }] },
  sake: { kcal: 134, emoji: '🍶', def: 180, servings: [{ k: 'glass', ml: 180 }, { k: 'bottle', ml: 300 }] },
  highball: { kcal: 50, emoji: '🥤', def: 355, servings: [{ k: 'glass', ml: 355 }, { k: 'can', ml: 500 }] },
  cola: { kcal: 42, emoji: '🥤', def: 355, servings: [{ k: 'cup', ml: 200 }, { k: 'can', ml: 355 }, { k: 'bottle', ml: 500 }] },
  cider: { kcal: 40, emoji: '🥤', def: 355, servings: [{ k: 'cup', ml: 200 }, { k: 'can', ml: 355 }, { k: 'bottle', ml: 500 }] },
  orangejuice: { kcal: 45, emoji: '🧃', def: 200, servings: [{ k: 'cup', ml: 200 }, { k: 'bottle', ml: 500 }] },
  latte: { kcal: 60, emoji: '☕', def: 355, servings: [{ k: 'cup', ml: 355 }, { k: 'large', ml: 473 }] },
  milk: { kcal: 63, emoji: '🥛', def: 200, servings: [{ k: 'cup', ml: 200 }, { k: 'carton', ml: 500 }] },
  sportsdrink: { kcal: 25, emoji: '🥤', def: 500, servings: [{ k: 'bottle', ml: 500 }] },
  energydrink: { kcal: 45, emoji: '🥤', def: 250, servings: [{ k: 'can', ml: 250 }] },
}
const DEFAULT_ORDER = ['soju', 'beer', 'makgeolli', 'wine', 'whisky', 'vodka', 'champagne', 'sake', 'highball', 'cola', 'cider', 'orangejuice', 'latte', 'milk', 'sportsdrink', 'energydrink']
// Most-relevant drinks first, per locale; the rest follow in the default order.
const PRIORITY: Record<string, string[]> = {
  ko: ['soju', 'beer', 'makgeolli'],
  en: ['beer', 'wine', 'whisky'],
  ja: ['beer', 'sake', 'soju'],
}

export default function DrinkCalorieCalculatorPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const prio = PRIORITY[locale] ?? []
  const order = [...prio, ...DEFAULT_ORDER.filter((k) => !prio.includes(k))]

  const [key, setKey] = useState(order[0])
  const [ml, setMl] = useState(DRINKS[order[0]].def)

  const drink = DRINKS[key] ?? DRINKS.soju
  const total = Math.round((drink.kcal * Math.max(0, ml)) / 100)
  const walkMin = Math.round(total / 4) // ~4 kcal/min walking

  const pickDrink = (k: string) => { setKey(k); setMl(DRINKS[k].def) }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-xs text-gray-500 mb-1">{t('dr_drink')}</label>
          <select value={key} onChange={(e) => pickDrink(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
            {order.map((k) => <option key={k} value={k}>{DRINKS[k].emoji} {t('dr_' + k)} ({DRINKS[k].kcal} kcal/100ml)</option>)}
          </select></div>

        <div><label className="block text-xs text-gray-500 mb-1">{t('dr_amount')} ({t('dr_ml')})</label>
          <input type="number" value={ml} onChange={(e) => setMl(Number(e.target.value))} min="0"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-violet-400" />
        </div>
        {/* Real-serving presets for the selected drink (its emoji + serving size). */}
        <div className="flex gap-2 flex-wrap">
          {drink.servings.map((s) => (
            <button key={s.k} onClick={() => setMl(s.ml)}
              className={'flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition ' + (ml === s.ml ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
              <span className="text-sm">{drink.emoji}</span> {t('dr_s_' + s.k)}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-5 border border-violet-100 text-center">
          <p className="text-4xl font-bold text-violet-600">{total.toLocaleString()} <span className="text-lg">kcal</span></p>
          <p className="text-2xl font-light text-gray-300 leading-none my-1">≈</p>
          <p className="font-bold text-gray-800 leading-tight"><span className="text-3xl align-middle">🚶</span> <span className="text-xl align-middle">{t('dr_walk', { n: walkMin })}</span></p>
          <p className="text-xs text-gray-400 mt-2">({t('dr_per100', { n: drink.kcal })})</p>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('dr_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
