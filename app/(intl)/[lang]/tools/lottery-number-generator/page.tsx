'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { LOTTERIES, DEFAULT_BY_LOCALE, type Lottery } from '@/lib/lotteries'

const tool = getToolBySlug('lottery-number-generator')!
// Country → flag emoji (UK uses the GB flag; renders as letters on Windows desktop).
const FLAG: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵', UK: '🇬🇧', AU: '🇦🇺', CA: '🇨🇦', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸' }
// Real Korean lotto ball colours by ten-band; extended palette for higher ranges.
const BALL_COLORS = ['#fbc400', '#69c8f2', '#ff7272', '#aaaaaa', '#b0d840', '#c490e4', '#ffa94d', '#5ec9a0']
const ballColor = (n: number) => BALL_COLORS[Math.floor((n - 1) / 10) % BALL_COLORS.length]
type Game = { main: number[]; bonus: number[] }
const parseNums = (s: string) => Array.from(new Set((s.match(/\d+/g) || []).map(Number)))

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
  const [revealed, setRevealed] = useState(0) // how many balls are shown (one-by-one)
  const [copied, setCopied] = useState(false)
  const [sound, setSound] = useState(true)

  const audioRef = useRef<AudioContext | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const lot: Lottery = LOTTERIES.find((l) => l.id === id) || LOTTERIES[0]

  function blip(freq: number, dur = 0.06, type: OscillatorType = 'triangle', vol = 0.12) {
    const ctx = audioRef.current; if (!ctx) return
    const o = ctx.createOscillator(); const g = ctx.createGain(); const t = ctx.currentTime
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02)
  }

  const generate = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = []
    if (sound) {
      try { const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (AC) { if (!audioRef.current) audioRef.current = new AC(); audioRef.current.resume() } } catch { /* ignore */ }
    }
    const l = LOTTERIES.find((x) => x.id === id) || LOTTERIES[0]
    const exclude = new Set(parseNums(excludeStr))
    const fixed = parseNums(fixedStr)
    const out: Game[] = []
    for (let g = 0; g < count; g++) {
      out.push({ main: pickN(l.mainMin, l.mainMax, l.mainCount, exclude, fixed), bonus: l.bonusCount > 0 ? pickN(l.bonusMin, l.bonusMax, l.bonusCount, new Set(), []) : [] })
    }
    setGames(out); setRevealed(0); setCopied(false)
    const total = out.reduce((s, g) => s + g.main.length + g.bonus.length, 0)
    const step = Math.max(280, Math.min(680, 8800 / Math.max(1, total))) // slow — one ball at a time
    // Exactly one sound per ball: the sound fires in the same tick the ball is revealed.
    for (let i = 1; i <= total; i++) {
      timers.current.push(setTimeout(() => { setRevealed(i); if (sound) blip(196 + ((i - 1) % 5) * 12, 0.09, 'sine', 0.14) }, i * step))
    }
  }, [id, count, fixedStr, excludeStr, sound])

  useEffect(() => { generate() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  function copy() {
    const text = `${lot.name[lang]}\n` + games.map((g, i) => `${i + 1}) ${g.main.join(' ')}${g.bonus.length ? ' + ' + g.bonus.join(' ') : ''}`).join('\n')
    navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const Ball = ({ n, bonus, shown }: { n: number; bonus?: boolean; shown: boolean }) => (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-100"
      style={{
        // glossy 3D sphere: top-left specular highlight + darkened bottom rim over the base colour
        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.3) 13%, rgba(255,255,255,0) 33%), radial-gradient(circle at 50% 84%, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 60%), ${ballColor(n)}`,
        boxShadow: `0 2px 3px rgba(0,0,0,.28), inset 0 -3px 5px rgba(0,0,0,.3), inset 0 2px 3px rgba(255,255,255,.45)${bonus ? ', 0 0 0 2px #f59e0b' : ''}`,
        opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.35)',
      }}>
      <span className="inline-flex items-center justify-center bg-white" style={{ width: '72%', height: '62%', borderRadius: '50%', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.2)' }}>
        <span className="text-xs font-extrabold tabular-nums text-gray-900">{n}</span>
      </span>
    </span>
  )

  let gi = 0 // running ball index for the one-by-one reveal

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Lottery — full width */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('lt_lottery')}</label>
          <select value={id} onChange={(e) => setId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-400">
            {LOTTERIES.map((l) => <option key={l.id} value={l.id}>{FLAG[l.country] || ''} {l.name[lang]} ({l.mainMin}-{l.mainMax} × {l.mainCount}{l.bonusCount > 0 ? ` +${l.bonusCount}` : ''})</option>)}
          </select>
        </div>
        {/* Games + fixed + exclude — one row */}
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('lt_games')}</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:border-brand-400">
              {[1, 3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label className="block text-xs text-gray-500 mb-1 truncate">{t('lt_fixed')}</label>
            <input value={fixedStr} onChange={(e) => setFixedStr(e.target.value)} inputMode="numeric" placeholder="7, 14"
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono focus:outline-none focus:border-brand-400" />
          </div>
          <div className="min-w-0">
            <label className="block text-xs text-gray-500 mb-1 truncate">{t('lt_exclude')}</label>
            <input value={excludeStr} onChange={(e) => setExcludeStr(e.target.value)} inputMode="numeric" placeholder="4, 13"
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono focus:outline-none focus:border-brand-400" />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={generate} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.3) 13%, rgba(255,255,255,0) 33%), radial-gradient(circle at 50% 84%, rgba(0,0,0,.4), rgba(0,0,0,0) 60%), #fbc400', boxShadow: 'inset 0 -2px 3px rgba(0,0,0,.28), inset 0 1px 2px rgba(255,255,255,.5)' }}><span className="bg-white" style={{ width: '64%', height: '54%', borderRadius: '50%' }} /></span>
            {games.length ? t('lt_regenerate') : t('lt_generate')}
          </button>
          <button onClick={() => setSound((s) => !s)} title={t('lt_sound')} aria-label={t('lt_sound')}
            className={'px-3 rounded-xl border transition ' + (sound ? 'border-brand-200 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50')}>{sound ? '🔊' : '🔇'}</button>
        </div>

        {games.length > 0 && (
          <div className="space-y-2">
            {games.map((g, i) => (
              <div key={i} className="flex items-center gap-1.5 flex-wrap rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1})</span>
                {g.main.map((n) => { const idx = gi++; return <Ball key={n} n={n} shown={idx < revealed} /> })}
                {g.bonus.length > 0 && <span className="text-gray-300 px-0.5">+</span>}
                {g.bonus.map((n) => { const idx = gi++; return <Ball key={'b' + n} n={n} bonus shown={idx < revealed} /> })}
              </div>
            ))}
            {lot.bonusCount > 0 && <p className="text-xs text-gray-400"><span className="inline-block w-2.5 h-2.5 rounded-full align-middle mr-1" style={{ boxShadow: '0 0 0 2px #f59e0b inset', background: '#fff' }} />{t('lt_bonus')}</p>}
            <button onClick={copy} className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">{copied ? '✓ ' + t('lt_copied') : '📋 ' + t('lt_copy')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('lt_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
