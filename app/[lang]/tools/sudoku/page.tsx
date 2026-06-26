'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('sudoku')!
const GIVENS: Record<string, number> = { sd_easy: 42, sd_medium: 34, sd_hard: 28 }

function ok(b: number[], i: number, v: number): boolean {
  const r = Math.floor(i / 9), c = i % 9
  for (let k = 0; k < 9; k++) { if (b[r * 9 + k] === v || b[k * 9 + c] === v) return false }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) if (b[(br + dr) * 9 + bc + dc] === v) return false
  return true
}
function fill(b: number[]): boolean {
  const i = b.indexOf(0); if (i < 0) return true
  const vs = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
  for (const v of vs) if (ok(b, i, v)) { b[i] = v; if (fill(b)) return true; b[i] = 0 }
  return false
}
function countSol(b: number[], limit = 2): number {
  const i = b.indexOf(0); if (i < 0) return 1
  let n = 0
  for (let v = 1; v <= 9; v++) if (ok(b, i, v)) { b[i] = v; n += countSol(b, limit); b[i] = 0; if (n >= limit) break }
  return n
}
function generate(givens: number): { puzzle: number[]; solution: number[] } {
  const sol = Array(81).fill(0); fill(sol)
  const puzzle = [...sol]
  const order = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5)
  let removed = 0
  for (const i of order) {
    if (81 - removed <= givens) break
    const bak = puzzle[i]; puzzle[i] = 0
    if (countSol([...puzzle]) !== 1) puzzle[i] = bak; else removed++
  }
  return { puzzle, solution: sol }
}

export default function SudokuPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [diff, setDiff] = useState('sd_easy')
  const [puzzle, setPuzzle] = useState<number[]>([])
  const [grid, setGrid] = useState<number[]>([])
  const [given, setGiven] = useState<boolean[]>([])
  const [sel, setSel] = useState(-1)
  const [time, setTime] = useState(0)
  const [best, setBest] = useState<Record<string, number>>({})
  const stage = useGameStage()

  const make = useCallback((d: string) => {
    const { puzzle } = generate(GIVENS[d])
    setDiff(d); setPuzzle(puzzle); setGrid([...puzzle]); setGiven(puzzle.map((v) => v !== 0)); setSel(-1); setTime(0)
  }, [])
  useEffect(() => { make('sd_easy') }, [make])
  useEffect(() => { try { setBest(JSON.parse(localStorage.getItem('sudoku-best') || '{}')) } catch { /* ignore */ } }, [])
  useEffect(() => { if (stage.phase === 'playing') make(diff) }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function put(v: number) { if (!stage.playing || sel < 0 || given[sel]) return; setGrid((g) => g.map((x, i) => (i === sel ? v : x))) }
  const conflict = (i: number) => { const v = grid[i]; if (!v) return false; return [...Array(9)].some((_, k) => (k !== i % 9 && grid[Math.floor(i / 9) * 9 + k] === v) || (k !== Math.floor(i / 9) && grid[k * 9 + (i % 9)] === v)) }
  const solved = grid.length === 81 && grid.every((v, i) => v !== 0 && !conflict(i))

  useEffect(() => {
    if (grid.length !== 81 || solved || !stage.playing) return
    const id = setInterval(() => setTime((t) => t + 0.1), 100)
    return () => clearInterval(id)
  }, [grid.length, solved, stage.playing])
  useEffect(() => {
    if (!solved) return
    setBest((b) => {
      const cur = b[diff]
      if (cur != null && cur <= time) return b
      const nb = { ...b, [diff]: time }
      localStorage.setItem('sudoku-best', JSON.stringify(nb))
      return nb
    })
    stage.finish()
  }, [solved]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="max-w-sm mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sd_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sd_subtitle')}</p>
        </div>

        <div className="flex justify-center gap-2 text-sm">
          {Object.keys(GIVENS).map((d) => <button key={d} onClick={() => { make(d); stage.reset() }} className={`px-3 py-1 rounded-full border ${diff === d ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t(d)}</button>)}
        </div>
        <div className="text-sm text-gray-600">⏱ {time.toFixed(1)}s{best[diff] != null ? ` · ${t('lb_best')} ${best[diff].toFixed(1)}s` : ''}</div>

        <div className="relative w-fit mx-auto">
          <div className="grid grid-cols-9 w-fit border-2 border-gray-800">
            {grid.map((v, i) => {
              const conf = conflict(i)
              return (
                <button key={i} onClick={() => setSel(i)}
                  className={`w-9 h-9 text-lg flex items-center justify-center ${given[i] ? 'font-bold text-gray-900' : conf ? 'text-rose-600' : 'text-brand-600'} ${sel === i ? 'bg-brand-100' : (Math.floor(i / 9) % 2 === Math.floor((i % 9) / 3) % 2 ? 'bg-white' : 'bg-gray-50')}`}
                  style={{ borderRight: (i % 9) % 3 === 2 && (i % 9) !== 8 ? '2px solid #1f2937' : '1px solid #e5e7eb', borderBottom: Math.floor(i / 9) % 3 === 2 && Math.floor(i / 9) !== 8 ? '2px solid #1f2937' : '1px solid #e5e7eb' }}>
                  {v || ''}
                </button>
              )
            })}
          </div>
          <GameStageOverlay stage={stage} />
        </div>

        {solved && <div className="rounded-xl bg-emerald-50 text-emerald-700 py-3 font-semibold">{t('sd_solved')}</div>}

        <div className="grid grid-cols-5 gap-1.5 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} onClick={() => put(n)} className="aspect-square rounded-lg bg-gray-100 text-lg font-semibold hover:bg-brand-100">{n}</button>)}
          <button onClick={() => put(0)} className="aspect-square rounded-lg bg-gray-100 hover:bg-rose-100">⌫</button>
        </div>
        <button onClick={stage.begin} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('sd_new')}</button>
      </div>
      <Leaderboard game={`sudoku-${diff.replace('sd_', '')}`} score={best[diff] != null ? Math.round(best[diff] * 10) / 10 : null} unit=" s" better="lower" />
    </ToolLayout>
  )
}
