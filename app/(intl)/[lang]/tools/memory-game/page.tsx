'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay , SoundToggle, sfx } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('memory-game')!
const EMOJI = ['🍎', '🍌', '🍇', '🍒', '🍋', '🍑', '🍓', '🥝', '🍉', '🥥', '🍍', '🥕']

type Card = { id: number; e: string; flipped: boolean; matched: boolean }
function deal(pairs: number): Card[] {
  const chosen = [...EMOJI].sort(() => Math.random() - 0.5).slice(0, pairs)
  return [...chosen, ...chosen].map((e, i) => ({ id: i, e, flipped: false, matched: false })).sort(() => Math.random() - 0.5)
}

export default function MemoryGamePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [pairs, setPairs] = useState(8)
  const [cards, setCards] = useState<Card[]>([])
  const [open, setOpen] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState<Record<number, number>>({})
  const stage = useGameStage()

  const reset = useCallback((p: number) => { setCards(deal(p)); setOpen([]); setMoves(0); setTime(0); setRunning(false) }, [])
  useEffect(() => { reset(pairs) }, [pairs, reset])
  useEffect(() => { if (stage.phase === 'playing') reset(pairs) }, [stage.phase, pairs, reset])
  useEffect(() => { if (!running) return; const id = setInterval(() => setTime((t) => t + 1), 1000); return () => clearInterval(id) }, [running])
  useEffect(() => { try { setBest(JSON.parse(localStorage.getItem('memory-best') || '{}')) } catch { /* ignore */ } }, [])

  const won = cards.length > 0 && cards.every((c) => c.matched)
  useEffect(() => { if (won) { setRunning(false); stage.finish() } }, [won]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!won) return
    setBest((b) => {
      const cur = b[pairs]
      if (cur != null && cur <= moves) return b
      const nb = { ...b, [pairs]: moves }
      localStorage.setItem('memory-best', JSON.stringify(nb))
      return nb
    })
  }, [won]) // eslint-disable-line react-hooks/exhaustive-deps

  function flip(idx: number) {
    if (!stage.playing || open.length === 2 || cards[idx].flipped || cards[idx].matched) return
    if (!running) setRunning(true)
    const nc = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c))
    const no = [...open, idx]
    setCards(nc); setOpen(no); sfx('move')
    if (no.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = no
      if (nc[a].e === nc[b].e) setTimeout(() => { sfx('point'); setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))); setOpen([]) }, 350)
      else setTimeout(() => { sfx('lose'); setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))); setOpen([]) }, 800)
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-sm mx-auto space-y-4 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('mg2_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('mg2_subtitle')}</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm">
          {[6, 8, 10].map((p) => <button key={p} onClick={() => { setPairs(p); stage.reset() }} className={`px-3 py-1 rounded-full border ${pairs === p ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{p * 2}{t('mg2_cards')}</button>)}
        </div>
        <div className="flex justify-center gap-6 text-sm text-gray-600"><span>{t('mg2_moves')}: <b>{moves}</b></span><span>{t('mg2_time')}: <b>{time}s</b></span>{best[pairs] != null && <span>{t('lb_best')}: <b>{best[pairs]}</b></span>}</div>

        <div className="relative">
          <div className="grid gap-2 grid-cols-4">
            {cards.map((c, i) => (
              <button key={c.id} onClick={() => flip(i)}
                className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-colors ${c.flipped || c.matched ? 'bg-white border-2 border-brand-200' : 'bg-brand-500 hover:bg-brand-600'} ${c.matched ? 'opacity-50' : ''}`}>
                {c.flipped || c.matched ? c.e : ''}
              </button>
            ))}
          </div>
          <GameStageOverlay stage={stage} />
        </div>

        {won && <div className="rounded-xl bg-emerald-50 text-emerald-700 py-3 font-semibold">{t('mg2_won', { moves, time })}</div>}
      </div>
      <Leaderboard game={`memory-${pairs}`} score={best[pairs] ?? null} better="lower" />
    </ToolLayout>
  )
}
