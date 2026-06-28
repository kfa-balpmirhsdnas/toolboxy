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
  const eg = ({ ko: '예) ', en: 'e.g. ', ja: '例) ' } as const)[lang]

  const [id, setId] = useState(DEFAULT_BY_LOCALE[lang] || 'us_powerball')
  const [count, setCount] = useState(5)
  const [fixedStr, setFixedStr] = useState('')
  const [excludeStr, setExcludeStr] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [revealed, setRevealed] = useState(0) // how many balls are shown (one-by-one)
  const [drawing, setDrawing] = useState(false) // 2s suspense before balls appear
  const [copied, setCopied] = useState(false)
  const [sound, setSound] = useState(true)

  const audioRef = useRef<AudioContext | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const lot: Lottery = LOTTERIES.find((l) => l.id === id) || LOTTERIES[0]

  function blip(freq: number, dur = 0.12, type: OscillatorType = 'sine', vol = 0.4) {
    const ctx = audioRef.current; if (!ctx) return
    const t = ctx.currentTime + 0.01 // small lookahead: never schedule in the past (fixes 1st-sound dropouts)
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.type = type; o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.012)
    g.gain.linearRampToValueAtTime(0, t + dur)
    o.connect(g); g.connect(ctx.destination)
    o.start(t); o.stop(t + dur + 0.03)
  }

  const generate = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = []
    if (sound) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (AC) {
          if (!audioRef.current) audioRef.current = new AC()
          const ctx = audioRef.current
          const click = () => blip(523, 0.1, 'triangle', 0.34) // sound the instant the button is pressed
          if (ctx.state === 'suspended') ctx.resume().then(click).catch(() => {}) // first press: play right after the context wakes
          else click()
        }
      } catch { /* ignore */ }
    }
    const l = LOTTERIES.find((x) => x.id === id) || LOTTERIES[0]
    const exclude = new Set(parseNums(excludeStr))
    const fixed = parseNums(fixedStr)
    const out: Game[] = []
    for (let g = 0; g < count; g++) {
      out.push({ main: pickN(l.mainMin, l.mainMax, l.mainCount, exclude, fixed), bonus: l.bonusCount > 0 ? pickN(l.bonusMin, l.bonusMax, l.bonusCount, new Set(), []) : [] })
    }
    setGames([]); setRevealed(0); setCopied(false); setDrawing(true)
    const total = out.reduce((s, g) => s + g.main.length + g.bonus.length, 0)
    const step = Math.max(1120, Math.min(2720, 35200 / Math.max(1, total))) // very slow — one ball at a time
    // 2s suspense after the click, then reveal one ball at a time with one sound each.
    timers.current.push(setTimeout(() => {
      setGames(out); setDrawing(false)
      // same order as the render (main balls then bonus balls, per game)
      const isBonus: boolean[] = []
      out.forEach((g) => { g.main.forEach(() => isBonus.push(false)); g.bonus.forEach(() => isBonus.push(true)) })
      for (let i = 1; i <= total; i++) {
        timers.current.push(setTimeout(() => { setRevealed(i); if (sound) blip(isBonus[i - 1] ? 330 : 262, 0.12, 'sine', 0.42) }, i * step)) // bonus a bit higher
      }
      // ending fanfare once the last ball is out (rising C-E-G-C arpeggio)
      const end = total * step + 500
      const notes: [number, number][] = [[523, 0.18], [659, 0.18], [784, 0.18], [1047, 0.42]]
      notes.forEach(([f, d], k) => timers.current.push(setTimeout(() => { if (sound) blip(f, d, 'triangle', 0.32) }, end + k * 130)))
    }, 2000))
  }, [id, count, fixedStr, excludeStr, sound])

  // No auto-draw: balls only appear on button click. Switching lottery clears the board.
  useEffect(() => { timers.current.forEach(clearTimeout); setGames([]); setRevealed(0); setDrawing(false) }, [id])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  function copy() {
    const text = `${lot.name[lang]}\n` + games.map((g, i) => `${i + 1}) ${g.main.join(' ')}${g.bonus.length ? ' + ' + g.bonus.join(' ') : ''}`).join('\n')
    navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const Ball = ({ n, bonus, shown, size = 36 }: { n: number; bonus?: boolean; shown: boolean; size?: number }) => (
    <span className="inline-flex items-center justify-center rounded-full transition-all duration-100"
      style={{
        width: size, height: size,
        // glossy 3D sphere: top-left specular highlight + darkened bottom rim over the base colour
        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.3) 13%, rgba(255,255,255,0) 33%), radial-gradient(circle at 50% 84%, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 60%), ${ballColor(n)}`,
        boxShadow: `0 2px 3px rgba(0,0,0,.28), inset 0 -3px 5px rgba(0,0,0,.3), inset 0 2px 3px rgba(255,255,255,.45)${bonus ? ', 0 0 0 2px #f59e0b' : ''}`,
        opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.35)',
      }}>
      <span className="inline-flex items-center justify-center rounded-full bg-white" style={{ width: '60%', height: '60%', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.2)' }}>
        <span className="font-extrabold tabular-nums text-gray-900" style={{ fontSize: size >= 36 ? 12 : 11 }}>{n}</span>
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
            <input value={fixedStr} onChange={(e) => setFixedStr(e.target.value)} inputMode="numeric" placeholder={eg + '7, 14'}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono focus:outline-none focus:border-brand-400" />
          </div>
          <div className="min-w-0">
            <label className="block text-xs text-gray-500 mb-1 truncate">{t('lt_exclude')}</label>
            <input value={excludeStr} onChange={(e) => setExcludeStr(e.target.value)} inputMode="numeric" placeholder={eg + '4, 13'}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono focus:outline-none focus:border-brand-400" />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={generate} disabled={drawing} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.3) 13%, rgba(255,255,255,0) 33%), radial-gradient(circle at 50% 84%, rgba(0,0,0,.4), rgba(0,0,0,0) 60%), #fbc400', boxShadow: 'inset 0 -2px 3px rgba(0,0,0,.28), inset 0 1px 2px rgba(255,255,255,.5)' }}><span className="rounded-full bg-white" style={{ width: '60%', height: '60%' }} /></span>
            {t('lt_draw')}
          </button>
          <button onClick={() => setSound((s) => !s)} title={t('lt_sound')} aria-label={t('lt_sound')}
            className={'px-3 rounded-xl border transition ' + (sound ? 'border-brand-200 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50')}>{sound ? '🔊' : '🔇'}</button>
        </div>

        {drawing && <div className="text-center py-8 text-gray-400 text-sm animate-pulse">🎰 {t('lt_drawing')}</div>}

        {games.length > 0 && (
          <div className="space-y-2">
            {games.map((g, i) => {
              const sz = g.main.length + g.bonus.length >= 8 ? 30 : 36 // shrink only when a row has 8 balls
              return (
                <div key={i} className="flex items-center justify-center gap-1 flex-wrap rounded-xl border border-gray-100 bg-gray-50 px-2 py-2">
                  {g.main.map((n) => { const idx = gi++; return <Ball key={n} n={n} shown={idx < revealed} size={sz} /> })}
                  {g.bonus.length > 0 && <span className="text-gray-300 px-0.5">+</span>}
                  {g.bonus.map((n) => { const idx = gi++; return <Ball key={'b' + n} n={n} bonus shown={idx < revealed} size={sz} /> })}
                </div>
              )
            })}
            {lot.bonusCount > 0 && <p className="text-xs text-gray-400"><span className="inline-block w-2.5 h-2.5 rounded-full align-middle mr-1" style={{ boxShadow: '0 0 0 2px #f59e0b inset', background: '#fff' }} />{t('lt_bonus')}</p>}
            <button onClick={copy} className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">{copied ? '✓ ' + t('lt_copied') : '📋 ' + t('lt_copy')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('lt_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
