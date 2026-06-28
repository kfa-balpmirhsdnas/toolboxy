'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { useGameStage, GameStageOverlay, SoundToggle, sfx, useFitCell } from '@/components/tools/GameStage'
import Leaderboard from '@/components/tools/Leaderboard'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('block-puzzle')!
const COLS = 10, ROWS = 20
const COLORS = ['', '#22d3ee', '#a78bfa', '#fb923c', '#facc15', '#4ade80', '#f472b6', '#60a5fa']
// 7 generic tetromino shapes (colour index in the matrix).
const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [[2, 0, 0], [2, 2, 2]],
  [[0, 0, 3], [3, 3, 3]],
  [[4, 4], [4, 4]],
  [[0, 5, 5], [5, 5, 0]],
  [[0, 6, 0], [6, 6, 6]],
  [[7, 7, 0], [0, 7, 7]],
]
type Piece = { m: number[][]; x: number; y: number }
const rotate = (m: number[][]) => m[0].map((_, i) => m.map((row) => row[i]).reverse())
const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))
const spawn = (): Piece => { const m = SHAPES[Math.floor(Math.random() * SHAPES.length)]; return { m, x: Math.floor((COLS - m[0].length) / 2), y: -m.length + 1 } }
function collides(b: number[][], p: Piece) {
  for (let y = 0; y < p.m.length; y++) for (let x = 0; x < p.m[y].length; x++) {
    if (!p.m[y][x]) continue
    const ny = p.y + y, nx = p.x + x
    if (nx < 0 || nx >= COLS || ny >= ROWS) return true
    if (ny >= 0 && b[ny][nx]) return true
  }
  return false
}
function merge(b: number[][], p: Piece) {
  const nb = b.map((r) => [...r])
  p.m.forEach((row, y) => row.forEach((v, x) => { if (v && p.y + y >= 0) nb[p.y + y][p.x + x] = v }))
  return nb
}
function clearLines(b: number[][]) {
  const kept = b.filter((row) => row.some((v) => !v))
  const cleared = ROWS - kept.length
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0))
  return { board: kept, cleared }
}

export default function BlockPuzzlePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const stage = useGameStage()
  const CELL = useFitCell(COLS, ROWS, { reserve: 272, maxCell: 30 }) // fill the screen without overflowing
  const [board, setBoard] = useState(emptyBoard())
  const pieceRef = useRef<Piece | null>(null)
  const [, force] = useState(0)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, setBest] = useState(0)
  const playing = stage.playing && !over

  useEffect(() => { try { setBest(Number(localStorage.getItem('bp-best') || 0)) } catch { /* */ } }, [])
  useEffect(() => { if (over) setBest((b) => { const n = Math.max(b, score); try { localStorage.setItem('bp-best', String(n)) } catch { /* */ } return n }) }, [over]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => { setBoard(emptyBoard()); pieceRef.current = spawn(); setScore(0); setOver(false); force((n) => n + 1) }, [])
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const lockAndNext = useCallback((b: number[][], p: Piece) => {
    const { board: nb, cleared } = clearLines(merge(b, p))
    setBoard(nb)
    sfx(cleared ? 'clear' : 'lock')
    if (cleared) setScore((s) => s + [0, 100, 300, 500, 800][cleared])
    const np = spawn()
    if (collides(nb, np)) { setOver(true); stage.finish() } else pieceRef.current = np
    force((n) => n + 1)
  }, [stage])

  const tick = useCallback(() => {
    const p = pieceRef.current; if (!p) return
    const moved = { ...p, y: p.y + 1 }
    if (collides(board, moved)) lockAndNext(board, p)
    else { pieceRef.current = moved; force((n) => n + 1) }
  }, [board, lockAndNext])

  useEffect(() => {
    if (!playing) return
    const speed = Math.max(110, 600 - Math.floor(score / 800) * 55)
    const id = setInterval(tick, speed)
    return () => clearInterval(id)
  }, [playing, tick, score])

  const move = (dx: number) => { const p = pieceRef.current; if (!p || !playing) return; const np = { ...p, x: p.x + dx }; if (!collides(board, np)) { pieceRef.current = np; sfx('move'); force((n) => n + 1) } }
  const rot = () => { const p = pieceRef.current; if (!p || !playing) return; const m = rotate(p.m); for (const k of [0, -1, 1, -2, 2]) { const c = { ...p, m, x: p.x + k }; if (!collides(board, c)) { pieceRef.current = c; sfx('rotate'); force((n) => n + 1); return } } }
  const hard = () => { const p = pieceRef.current; if (!p || !playing) return; let np = { ...p }; while (!collides(board, { ...np, y: np.y + 1 })) np = { ...np, y: np.y + 1 }; sfx('drop'); lockAndNext(board, np) }

  useEffect(() => {
    if (!playing) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(1) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); tick() }
      else if (e.key === 'ArrowUp') { e.preventDefault(); rot() }
      else if (e.key === ' ') { e.preventDefault(); hard() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [playing, board]) // eslint-disable-line react-hooks/exhaustive-deps

  const view = board.map((r) => [...r])
  const p = pieceRef.current
  if (p) p.m.forEach((row, y) => row.forEach((v, x) => { if (v && p.y + y >= 0 && p.y + y < ROWS) view[p.y + y][p.x + x] = v }))
  const ctrl = 'py-3 rounded-lg bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 active:scale-95 transition'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-xs mx-auto space-y-3 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('bp_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('bp_subtitle')}</p>
        </div>
        <div className="font-semibold text-gray-700 h-6">{t('bp_score')}: {score.toLocaleString()}</div>
        <div className="relative mx-auto" style={{ width: COLS * CELL + COLS + 1 }}>
          <div className="grid gap-px bg-gray-200 p-px rounded" style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL}px)` }}>
            {view.flat().map((v, i) => <div key={i} style={{ width: CELL, height: CELL, background: v ? COLORS[v] : '#f8fafc' }} />)}
          </div>
          <GameStageOverlay stage={stage} />
        </div>
        <div className="grid grid-cols-4 gap-2 max-w-[230px] mx-auto">
          <button onClick={() => move(-1)} className={ctrl} aria-label="left">◀</button>
          <button onClick={rot} className={ctrl} aria-label="rotate">⟳</button>
          <button onClick={() => move(1)} className={ctrl} aria-label="right">▶</button>
          <button onClick={hard} className={ctrl} aria-label="drop">⤓</button>
        </div>
        <p className="text-xs text-gray-400">{t('bp_help')}</p>
      </div>
      <Leaderboard game="block-puzzle" score={best || null} better="higher" />
    </ToolLayout>
  )
}
