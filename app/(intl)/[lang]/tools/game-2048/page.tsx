'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay , SoundToggle, sfx } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('game-2048')!
const COLORS: Record<number, string> = { 0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' }

function spawn(b: number[]) { const e = b.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0); if (!e.length) return b; const i = e[Math.floor(Math.random() * e.length)]; const n = [...b]; n[i] = Math.random() < 0.9 ? 2 : 4; return n }
function slide(row: number[]) { const a = row.filter((v) => v); let s = 0; for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; s += a[i]; a.splice(i + 1, 1) } while (a.length < 4) a.push(0); return { row: a, s } }
function move(b: number[], dir: number) {
  let score = 0; const n = [...b]
  for (let i = 0; i < 4; i++) {
    let idx = dir === 0 || dir === 1 ? [0, 1, 2, 3].map((j) => i * 4 + j) : [0, 1, 2, 3].map((j) => j * 4 + i)
    if (dir === 1 || dir === 3) idx = [...idx].reverse()
    const { row, s } = slide(idx.map((k) => n[k])); score += s; idx.forEach((k, j) => (n[k] = row[j]))
  }
  return { board: n, score, moved: n.some((v, i) => v !== b[i]) }
}

export default function Game2048Page({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [board, setBoard] = useState<number[]>(Array(16).fill(0))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const stage = useGameStage()
  const playingRef = useRef(false)
  useEffect(() => { playingRef.current = stage.playing }, [stage.playing])

  const reset = useCallback(() => { setBoard(spawn(spawn(Array(16).fill(0)))); setScore(0); setOver(false) }, [])
  useEffect(() => { reset(); setBest(+(localStorage.getItem('g2048-best') || 0)) }, [reset])
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase, reset])
  useEffect(() => { if (over) stage.finish() }, [over]) // eslint-disable-line react-hooks/exhaustive-deps

  const doMove = useCallback((dir: number) => {
    if (!playingRef.current) return
    setBoard((b) => {
      const { board: nb, score: s, moved } = move(b, dir)
      if (!moved) return b
      const withNew = spawn(nb); sfx(s > 0 ? 'point' : 'move')
      setScore((sc) => { const ns = sc + s; setBest((bb) => { const nb2 = Math.max(bb, ns); localStorage.setItem('g2048-best', String(nb2)); return nb2 }); return ns })
      if (![0, 1, 2, 3].some((d) => move(withNew, d).moved)) setOver(true)
      return withNew
    })
  }, [])

  useEffect(() => {
    const k = (e: KeyboardEvent) => { const m: Record<string, number> = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }; if (m[e.key] !== undefined) { e.preventDefault(); doMove(m[e.key]) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [doMove])

  let sx = 0, sy = 0
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-xs mx-auto space-y-4 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('g2_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('g2_subtitle')}</p>
        </div>

        <div className="flex justify-between text-sm">
          <div className="rounded-lg bg-gray-100 px-4 py-1.5"><div className="text-xs text-gray-400">{t('g2_score')}</div><b className="text-gray-800">{score}</b></div>
          <div className="rounded-lg bg-gray-100 px-4 py-1.5"><div className="text-xs text-gray-400">{t('g2_best')}</div><b className="text-gray-800">{best}</b></div>
        </div>

        <div className="relative rounded-xl p-2 mx-auto" style={{ background: '#bbada0', width: 280, height: 280 }}
          onTouchStart={(e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 0) : (dy > 0 ? 3 : 2)) }}>
          <div className="grid grid-cols-4 gap-2 h-full">
            {board.map((v, i) => (
              <div key={i} className="rounded-md flex items-center justify-center font-bold" style={{ background: COLORS[v] || '#3c3a32', color: v > 4 ? '#f9f6f2' : '#776e65', fontSize: v >= 1024 ? 20 : v >= 128 ? 24 : 28 }}>{v || ''}</div>
            ))}
          </div>
          {over && <div className="absolute inset-0 rounded-xl bg-white/70 flex flex-col items-center justify-center gap-2"><b className="text-xl text-gray-800">{t('g2_over')}</b><button onClick={stage.begin} className="px-4 py-2 bg-brand-600 text-white rounded-xl">{t('g2_retry')}</button></div>}
          <GameStageOverlay stage={stage} />
        </div>

        <button onClick={stage.begin} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('g2_new')}</button>
        <p className="text-xs text-gray-400">{t('g2_note')}</p>
      </div>
      <Leaderboard game="game-2048" score={best || null} better="higher" />
    </ToolLayout>
  )
}
