'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { useGameStage, GameStageOverlay, SoundToggle, sfx, useFitCell } from '@/components/tools/GameStage'
import Leaderboard from '@/components/tools/Leaderboard'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('snake')!
const N = 17
type P = { x: number; y: number }
const eq = (a: P, b: P) => a.x === b.x && a.y === b.y
const randFood = (snake: P[]): P => {
  let f: P
  do { f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) } } while (snake.some((s) => eq(s, f)))
  return f
}

export default function SnakePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const stage = useGameStage()
  const [CELL, boxRef] = useFitCell(N, N, { reserve: 320, maxCell: 22 }) // fill the screen without overflowing
  const snakeRef = useRef<P[]>([{ x: 8, y: 8 }])
  const dirRef = useRef<P>({ x: 1, y: 0 })
  const nextDir = useRef<P>({ x: 1, y: 0 })
  const foodRef = useRef<P>({ x: 12, y: 8 })
  const [, force] = useState(0)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, setBest] = useState(0)
  const playing = stage.playing && !over

  useEffect(() => { try { setBest(Number(localStorage.getItem('snake-best') || 0)) } catch { /* */ } }, [])
  useEffect(() => { if (over) setBest((b) => { const n = Math.max(b, score); try { localStorage.setItem('snake-best', String(n)) } catch { /* */ } return n }) }, [over]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    snakeRef.current = [{ x: 8, y: 8 }]; dirRef.current = { x: 1, y: 0 }; nextDir.current = { x: 1, y: 0 }
    foodRef.current = randFood(snakeRef.current); setScore(0); setOver(false); force((n) => n + 1)
  }, [])
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const turn = (d: P) => { const c = dirRef.current; if (d.x === -c.x && d.y === -c.y) return; nextDir.current = d }

  useEffect(() => {
    if (!playing) return
    const speed = Math.max(80, 150 - Math.floor(score / 5) * 8)
    const id = setInterval(() => {
      dirRef.current = nextDir.current
      const snake = snakeRef.current
      const head = { x: snake[0].x + dirRef.current.x, y: snake[0].y + dirRef.current.y }
      if (head.x < 0 || head.x >= N || head.y < 0 || head.y >= N || snake.some((s) => eq(s, head))) {
        setOver(true); stage.finish(); return
      }
      const ate = eq(head, foodRef.current)
      const ns = [head, ...snake]
      if (ate) { setScore((s) => s + 1); foodRef.current = randFood(ns); sfx('eat') } else ns.pop()
      snakeRef.current = ns; force((n) => n + 1)
    }, speed)
    return () => clearInterval(id)
  }, [playing, score]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing) return
    const h = (e: KeyboardEvent) => {
      const m: Record<string, P> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } }
      if (m[e.key]) { e.preventDefault(); turn(m[e.key]) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

  const snake = snakeRef.current, food = foodRef.current
  const cellAt = (x: number, y: number) => {
    if (eq(snake[0], { x, y })) return '#16a34a'
    if (snake.some((s) => eq(s, { x, y }))) return '#4ade80'
    if (eq(food, { x, y })) return '#ef4444'
    return '#f8fafc'
  }
  const ctrl = 'py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition inline-flex items-center justify-center'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={boxRef} data-game-stage className="relative w-full max-w-sm mx-auto space-y-3 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sn_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sn_subtitle')}</p>
        </div>
        <div className="font-semibold text-gray-700 h-6">{t('sn_score')}: {score}</div>
        <div className="relative mx-auto" style={{ width: N * CELL + N + 1 }}>
          <div className="grid gap-px bg-gray-200 p-px rounded" style={{ gridTemplateColumns: `repeat(${N}, ${CELL}px)` }}>
            {Array.from({ length: N * N }).map((_, i) => {
              const x = i % N, y = Math.floor(i / N)
              return <div key={i} style={{ width: CELL, height: CELL, background: cellAt(x, y), borderRadius: 2 }} />
            })}
          </div>
          <GameStageOverlay stage={stage} />
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
          <span />
          <button onClick={() => turn({ x: 0, y: -1 })} className={ctrl} aria-label="up"><ToolIcon name="chevron-up" className="w-5 h-5" /></button>
          <span />
          <button onClick={() => turn({ x: -1, y: 0 })} className={ctrl} aria-label="left"><ToolIcon name="chevron-left" className="w-5 h-5" /></button>
          <button onClick={() => turn({ x: 0, y: 1 })} className={ctrl} aria-label="down"><ToolIcon name="chevron-down" className="w-5 h-5" /></button>
          <button onClick={() => turn({ x: 1, y: 0 })} className={ctrl} aria-label="right"><ToolIcon name="chevron-right" className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-gray-400">{t('sn_help')}</p>
      </div>
      <Leaderboard game="snake" score={best || null} better="higher" />
    </ToolLayout>
  )
}
