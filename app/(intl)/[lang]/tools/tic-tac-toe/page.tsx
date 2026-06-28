'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { useGameStage, GameStageOverlay , SoundToggle, sfx } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('tic-tac-toe')!
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
type Cell = 'X' | 'O' | null

function winner(b: Cell[]): Cell | 'draw' | null {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  return b.every(Boolean) ? 'draw' : null
}
function minimax(b: Cell[], me: Cell, turn: Cell): number {
  const w = winner(b)
  if (w === me) return 10; if (w && w !== 'draw') return -10; if (w === 'draw') return 0
  const scores = b.map((v, i) => (v ? null : i)).filter((i) => i !== null).map((i) => {
    const nb = [...b]; nb[i as number] = turn
    return minimax(nb, me, turn === 'X' ? 'O' : 'X')
  })
  return turn === me ? Math.max(...scores) : Math.min(...scores)
}
function bestMove(b: Cell[], me: Cell): number {
  let best = -Infinity, mv = -1
  b.forEach((v, i) => { if (!v) { const nb = [...b]; nb[i] = me; const s = minimax(nb, me, me === 'X' ? 'O' : 'X'); if (s > best) { best = s; mv = i } } })
  return mv
}

export default function TicTacToePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [vsAI, setVsAI] = useState(true)
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [xTurn, setXTurn] = useState(true)
  const stage = useGameStage()
  const w = winner(board)

  function play(i: number) {
    if (!stage.playing || board[i] || w) return
    const nb = [...board]; nb[i] = xTurn ? 'X' : 'O'
    setBoard(nb); setXTurn(!xTurn); sfx('drop')
    if (vsAI && !winner(nb)) {
      const mv = bestMove(nb, 'O')
      if (mv >= 0) setTimeout(() => { setBoard((b) => { if (b[mv] || winner(b)) return b; const n2 = [...b]; n2[mv] = 'O'; return n2 }); setXTurn(true) }, 250)
    }
  }
  const reset = () => { setBoard(Array(9).fill(null)); setXTurn(true) }
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (w) stage.finish() }, [w]) // eslint-disable-line react-hooks/exhaustive-deps

  const status = w === 'draw' ? t('ttt_draw') : w ? t('ttt_win', { p: w }) : t('ttt_turn', { p: xTurn ? 'X' : 'O' })

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-xs mx-auto space-y-4 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ttt_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ttt_subtitle')}</p>
        </div>

        <div className="flex justify-center gap-2 text-sm">
          <button onClick={() => { setVsAI(true); reset(); stage.reset() }} className={`px-3 py-1 rounded-full border ${vsAI ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('ttt_ai')}</button>
          <button onClick={() => { setVsAI(false); reset(); stage.reset() }} className={`px-3 py-1 rounded-full border ${!vsAI ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('ttt_2p')}</button>
        </div>

        <div className="font-semibold text-gray-700 h-6">{status}</div>

        <div className="relative w-60 mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {board.map((c, i) => (
              <button key={i} onClick={() => play(i)} disabled={!!c || !!w || (vsAI && !xTurn)}
                className={`aspect-square rounded-xl border-2 border-gray-200 text-4xl font-bold flex items-center justify-center ${c === 'X' ? 'text-brand-600' : 'text-rose-500'} hover:bg-gray-50`}>{c}</button>
            ))}
          </div>
          <GameStageOverlay stage={stage} />
        </div>
      </div>
    </ToolLayout>
  )
}
