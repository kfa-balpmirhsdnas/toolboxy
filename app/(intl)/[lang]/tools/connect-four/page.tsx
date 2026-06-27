'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { useGameStage, GameStageOverlay } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('connect-four')!
const COLS = 7, ROWS = 6
type Cell = 0 | 1 | 2 // 0 empty, 1 player(red), 2 opponent(yellow)
const empty = (): Cell[][] => Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[])

const dropRow = (b: Cell[][], c: number) => { for (let r = ROWS - 1; r >= 0; r--) if (!b[r][c]) return r; return -1 }
function wins(b: Cell[][], p: Cell): boolean {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (b[r][c] !== p) continue
    for (const [dr, dc] of dirs) {
      let k = 1
      while (k < 4) { const nr = r + dr * k, nc = c + dc * k; if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[nr][nc] !== p) break; k++ }
      if (k === 4) return true
    }
  }
  return false
}
const full = (b: Cell[][]) => b[0].every((v) => v)
function aiMove(b: Cell[][]): number {
  const cols = Array.from({ length: COLS }, (_, i) => i).filter((c) => dropRow(b, c) >= 0)
  for (const p of [2, 1] as Cell[]) { // win, then block
    for (const c of cols) { const r = dropRow(b, c); const nb = b.map((x) => [...x]); nb[r][c] = p; if (wins(nb, p)) return c }
  }
  const order = [3, 2, 4, 1, 5, 0, 6].filter((c) => cols.includes(c))
  return order[0] ?? cols[0]
}

export default function ConnectFourPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const stage = useGameStage()
  const [vsAI, setVsAI] = useState(true)
  const [board, setBoard] = useState<Cell[][]>(empty())
  const [turn, setTurn] = useState<Cell>(1)
  const [result, setResult] = useState<'1' | '2' | 'draw' | null>(null)

  const reset = useCallback(() => { setBoard(empty()); setTurn(1); setResult(null) }, [])
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const settle = (b: Cell[][], p: Cell): boolean => {
    if (wins(b, p)) { setResult(p === 1 ? '1' : '2'); stage.finish(); return true }
    if (full(b)) { setResult('draw'); stage.finish(); return true }
    return false
  }

  function drop(c: number) {
    if (!stage.playing || result || (vsAI && turn !== 1)) return
    const r = dropRow(board, c); if (r < 0) return
    const nb = board.map((x) => [...x]); nb[r][c] = turn; setBoard(nb)
    if (settle(nb, turn)) return
    if (vsAI) {
      setTurn(2)
      setTimeout(() => {
        const ac = aiMove(nb); const ar = dropRow(nb, ac); if (ar < 0) return
        const ab = nb.map((x) => [...x]); ab[ar][ac] = 2; setBoard(ab)
        if (!settle(ab, 2)) setTurn(1)
      }, 350)
    } else setTurn(turn === 1 ? 2 : 1)
  }

  const status = result === 'draw' ? t('c4_draw')
    : result ? t('c4_win', { p: result === '1' ? t('c4_red') : t('c4_yellow') })
      : t('c4_turn', { p: turn === 1 ? t('c4_red') : t('c4_yellow') })
  const disc = (v: Cell) => v === 1 ? '#ef4444' : v === 2 ? '#facc15' : '#fff'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="max-w-sm mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('c4_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('c4_subtitle')}</p>
        </div>
        <div className="flex justify-center gap-2 text-sm">
          <button onClick={() => { setVsAI(true); reset(); stage.reset() }} className={`px-3 py-1 rounded-full border ${vsAI ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('c4_ai')}</button>
          <button onClick={() => { setVsAI(false); reset(); stage.reset() }} className={`px-3 py-1 rounded-full border ${!vsAI ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('c4_2p')}</button>
        </div>
        <div className="font-semibold text-gray-700 h-6">{status}</div>
        <div className="relative inline-block">
          <div className="inline-grid gap-1.5 p-2 rounded-2xl bg-blue-600" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {board.map((row, r) => row.map((v, c) => (
              <button key={`${r}-${c}`} onClick={() => drop(c)} aria-label={`col ${c + 1}`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full transition active:scale-95" style={{ background: disc(v) }} />
            )))}
          </div>
          <GameStageOverlay stage={stage} />
        </div>
        <button onClick={stage.begin} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('c4_new')}</button>
      </div>
    </ToolLayout>
  )
}
