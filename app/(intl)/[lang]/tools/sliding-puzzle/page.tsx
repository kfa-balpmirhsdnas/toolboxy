'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay , SoundToggle, sfx } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('sliding-puzzle')!
const SOLVED = Array.from({ length: 15 }, (_, i) => i + 1).concat(0)
const adj = (a: number, b: number) => { const ar = Math.floor(a / 4), ac = a % 4, br = Math.floor(b / 4), bc = b % 4; return Math.abs(ar - br) + Math.abs(ac - bc) === 1 }

function shuffled(): number[] {
  const b = [...SOLVED]
  for (let k = 0; k < 300; k++) { const z = b.indexOf(0); const ns = [z - 4, z + 4, z % 4 ? z - 1 : -1, z % 4 < 3 ? z + 1 : -1].filter((n) => n >= 0 && n < 16); const m = ns[Math.floor(Math.random() * ns.length)];[b[z], b[m]] = [b[m], b[z]] }
  return b
}

export default function SlidingPuzzlePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [board, setBoard] = useState<number[]>(SOLVED)
  const [moves, setMoves] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const stage = useGameStage()
  const reset = useCallback(() => { setBoard(shuffled()); setMoves(0) }, [])
  useEffect(() => { reset() }, [reset])
  useEffect(() => { if (stage.phase === 'playing') reset() }, [stage.phase, reset])
  useEffect(() => { const v = localStorage.getItem('sliding-best'); if (v) setBest(+v) }, [])

  const solved = board.every((v, i) => v === SOLVED[i])
  useEffect(() => {
    if (!solved || moves === 0) return
    setBest((b) => { const nb = b == null || moves < b ? moves : b; localStorage.setItem('sliding-best', String(nb)); return nb })
    stage.finish()
  }, [solved]) // eslint-disable-line react-hooks/exhaustive-deps
  function click(i: number) {
    if (!stage.playing) return
    const z = board.indexOf(0)
    if (!adj(i, z)) return
    const nb = [...board];[nb[i], nb[z]] = [nb[z], nb[i]]; setBoard(nb); setMoves((m) => m + 1); sfx('move')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-xs mx-auto space-y-4 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sp2_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sp2_subtitle')}</p>
        </div>

        <div className="text-sm text-gray-600">{t('sp2_moves')}: <b>{moves}</b>{best != null ? ` · ${t('lb_best')} ${best}` : ''}</div>

        <div className="relative mx-auto" style={{ width: 280 }}>
          <div className="grid grid-cols-4 gap-1.5" style={{ width: 280, height: 280 }}>
            {board.map((v, i) => (
              <button key={i} onClick={() => click(i)} disabled={v === 0}
                className={`rounded-lg text-xl font-bold ${v === 0 ? 'bg-transparent' : solved ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>{v || ''}</button>
            ))}
          </div>
          <GameStageOverlay stage={stage} />
        </div>

        {solved && moves > 0 && <div className="rounded-xl bg-emerald-50 text-emerald-700 py-3 font-semibold">{t('sp2_done', { moves })}</div>}
        <button onClick={stage.begin} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('sp2_new')}</button>
      </div>
      <Leaderboard game="sliding-puzzle" score={best} better="lower" />
    </ToolLayout>
  )
}
