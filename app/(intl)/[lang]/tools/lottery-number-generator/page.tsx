'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { LOTTERIES, DEFAULT_BY_LOCALE, type Lottery } from '@/lib/lotteries'

const tool = getToolBySlug('lottery-number-generator')!
// Country → flag emoji (UK uses the GB flag; renders as letters on Windows desktop).
const FLAG: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵', UK: '🇬🇧', AU: '🇦🇺', CA: '🇨🇦', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸' }
type Game = { main: number[]; bonus: number[] }
const parseNums = (s: string) => Array.from(new Set((s.match(/\d+/g) || []).map(Number)))

// Pick `count` unique numbers in [min,max], excluding `exclude`, forcing `fixed` in, ascending.
function pickN(min: number, max: number, count: number, exclude: Set<number>, fixed: number[]): number[] {
  const fix = fixed.filter((n) => n >= min && n <= max && !exclude.has(n)).slice(0, count)
  const pool: number[] = []
  for (let n = min; n <= max; n++) if (!exclude.has(n) && !fix.includes(n)) pool.push(n)
  const need = Math.max(0, count - fix.length)
  const out = [...fix]
  for (let i = 0; i < need && pool.length; i++) { const j = Math.floor(Math.random() * pool.length); out.push(pool[j]); pool.splice(j, 1) }
  return out.sort((a, b) => a - b)
}

export default function LotteryNumberGeneratorPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const lang = (['ko', 'en', 'ja'].includes(locale) ? locale : 'en') as 'ko' | 'en' | 'ja'

  const [id, setId] = useState(DEFAULT_BY_LOCALE[lang] || 'us_powerball')
  const [count, setCount] = useState(5)
  const [fixedStr, setFixedStr] = useState('')
  const [excludeStr, setExcludeStr] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [copied, setCopied] = useState(false)

  const lot: Lottery = LOTTERIES.find((l) => l.id === id) || LOTTERIES[0]

  const generate = useCallback(() => {
    const l = LOTTERIES.find((x) => x.id === id) || LOTTERIES[0]
    const exclude = new Set(parseNums(excludeStr))
    const fixed = parseNums(fixedStr)
    const out: Game[] = []
    for (let g = 0; g < count; g++) {
      out.push({
        main: pickN(l.mainMin, l.mainMax, l.mainCount, exclude, fixed),
        bonus: l.bonusCount > 0 ? pickN(l.bonusMin, l.bonusMax, l.bonusCount, new Set(), []) : [],
      })
    }
    setGames(out); setCopied(false)
  }, [id, count, fixedStr, excludeStr])

  // Generate on first load + whenever the lottery changes.
  useEffect(() => { generate() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id])

  function copy() {
    const text = `${lot.name[lang]}\n` + games.map((g, i) => `${i + 1}) ${g.main.join(' ')}${g.bonus.length ? ' + ' + g.bonus.join(' ') : ''}`).join('\n')
    navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const Ball = ({ n, bonus }: { n: number; bonus?: boolean }) => (
    <span className={'inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold tabular-nums shadow-sm ' + (bonus ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white')}>{n}</span>
  )

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('lt_lottery')}</label>
            <select value={id} onChange={(e) => setId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-400">
              {LOTTERIES.map((l) => <option key={l.id} value={l.id}>{FLAG[l.country] || ''} {l.name[lang]} ({l.mainMin}-{l.mainMax} × {l.mainCount}{l.bonusCount > 0 ? ` +${l.bonusCount}` : ''})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('lt_games')}</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-400">
              {[1, 3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('lt_fixed')}</label>
            <input value={fixedStr} onChange={(e) => setFixedStr(e.target.value)} inputMode="numeric" placeholder="7, 14"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('lt_exclude')}</label>
            <input value={excludeStr} onChange={(e) => setExcludeStr(e.target.value)} inputMode="numeric" placeholder="4, 13"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-400" />
          </div>
        </div>

        <button onClick={generate} className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition">🎲 {games.length ? t('lt_regenerate') : t('lt_generate')}</button>

        {games.length > 0 && (
          <div className="space-y-2">
            {games.map((g, i) => (
              <div key={i} className="flex items-center gap-1.5 flex-wrap rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1})</span>
                {g.main.map((n) => <Ball key={n} n={n} />)}
                {g.bonus.length > 0 && <span className="text-gray-300 px-0.5">+</span>}
                {g.bonus.map((n) => <Ball key={'b' + n} n={n} bonus />)}
              </div>
            ))}
            {lot.bonusCount > 0 && <p className="text-xs text-gray-400"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 align-middle mr-1" />{t('lt_bonus')}</p>}
            <button onClick={copy} className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">{copied ? '✓ ' + t('lt_copied') : '📋 ' + t('lt_copy')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('lt_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
