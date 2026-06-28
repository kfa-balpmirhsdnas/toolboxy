'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay, MuteToggle, sfx } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('aim-trainer')!
const DURATION = 30

export default function AimTrainerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const stage = useGameStage()
  const [playing, setPlaying] = useState(false)
  const [hits, setHits] = useState(0)
  const [time, setTime] = useState(DURATION)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [best, setBest] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)

  const move = useCallback(() => setPos({ x: 8 + Math.random() * 84, y: 8 + Math.random() * 84 }), [])
  useEffect(() => { const b = localStorage.getItem('aim-best'); if (b) setBest(+b) }, [])
  // real round starts when the countdown finishes
  useEffect(() => { if (stage.phase === 'playing') { setHits(0); setTime(DURATION); setPlaying(true); move() } }, [stage.phase, move])
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTime((tm) => { if (tm <= 0.1) { setPlaying(false); setHits((h) => { setBest((bb) => { const nb = Math.max(bb, h); localStorage.setItem('aim-best', String(nb)); return nb }); return h }); stage.finish(); return 0 } return tm - 0.1 }), 100)
    return () => clearInterval(id)
  }, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

  function hit(e: React.MouseEvent) { e.stopPropagation(); if (!playing) return; setHits((h) => h + 1); move(); sfx('hit') }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="max-w-sm mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('at_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('at_subtitle')}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{t('at_hits')}: <b className="text-brand-600">{hits}</b></span>
          <span>{t('at_time')}: <b>{time.toFixed(0)}s</b></span>
          <span>{t('at_best')}: <b>{best}</b></span>
          <MuteToggle stage={stage} />
        </div>

        <div ref={boxRef} className="relative rounded-xl bg-gray-100 mx-auto overflow-hidden" style={{ width: 300, height: 300 }}>
          {stage.playing && (
            <button onClick={hit} className="absolute w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 -translate-x-1/2 -translate-y-1/2 ring-4 ring-rose-200" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />
          )}
          <GameStageOverlay stage={stage} />
        </div>
        <p className="text-xs text-gray-400">{t('at_note')}</p>
      </div>
      <Leaderboard game="aim-trainer" score={best || null} better="higher" />
    </ToolLayout>
  )
}
