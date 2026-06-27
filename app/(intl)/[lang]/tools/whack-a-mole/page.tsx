'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { useGameStage, GameStageOverlay } from '@/components/tools/GameStage'
import Leaderboard from '@/components/tools/Leaderboard'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('whack-a-mole')!
const HOLES = 9, DURATION = 30

export default function WhackAMolePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const stage = useGameStage()
  const [mole, setMole] = useState(-1)
  const [bonk, setBonk] = useState(-1)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(DURATION)
  const [best, setBest] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const playing = stage.playing && time > 0

  useEffect(() => { try { setBest(Number(localStorage.getItem('wm-best') || 0)) } catch { /* */ } }, [])
  useEffect(() => { if (stage.phase === 'finished') setBest((b) => { const n = Math.max(b, score); try { localStorage.setItem('wm-best', String(n)) } catch { /* */ } return n }) }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => { setScore(0); setTime(DURATION); setMole(-1); setBonk(-1) }, [])
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // countdown timer
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [playing])
  useEffect(() => { if (stage.playing && time === 0) { setMole(-1); stage.finish() } }, [time]) // eslint-disable-line react-hooks/exhaustive-deps

  // mole spawner
  useEffect(() => {
    if (!playing) return
    let alive = true
    const pop = () => {
      if (!alive) return
      const h = Math.floor(Math.random() * HOLES)
      setMole(h)
      const up = 650 + Math.random() * 500
      const t1 = setTimeout(() => { setMole((m) => (m === h ? -1 : m)) }, up)
      const t2 = setTimeout(pop, up + 250 + Math.random() * 350)
      timers.current.push(t1, t2)
    }
    pop()
    return () => { alive = false; timers.current.forEach(clearTimeout); timers.current = [] }
  }, [playing])

  function whack(i: number) {
    if (!playing || i !== mole) return
    setScore((s) => s + 1); setMole(-1); setBonk(i)
    setTimeout(() => setBonk((b) => (b === i ? -1 : b)), 200)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="max-w-xs mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('wm_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('wm_subtitle')}</p>
        </div>
        <div className="flex justify-center gap-6 font-semibold text-gray-700">
          <span>{t('wm_score')}: {score}</span>
          <span className={time <= 5 ? 'text-rose-500' : ''}>{t('wm_time')}: {time}s</span>
        </div>
        <div className="relative inline-block">
          <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-amber-100">
            {Array.from({ length: HOLES }).map((_, i) => (
              <button key={i} onClick={() => whack(i)} aria-label={`hole ${i + 1}`}
                className="w-20 h-20 rounded-full bg-amber-800/80 flex items-center justify-center overflow-hidden active:scale-95 transition">
                <span className="text-4xl transition-transform duration-100" style={{ transform: i === mole ? 'translateY(0)' : 'translateY(120%)' }}>
                  {bonk === i ? '💥' : '🐹'}
                </span>
              </button>
            ))}
          </div>
          <GameStageOverlay stage={stage} />
        </div>
        <p className="text-xs text-gray-400">{t('wm_help')}</p>
      </div>
      <Leaderboard game="whack-a-mole" score={best || null} better="higher" />
    </ToolLayout>
  )
}
