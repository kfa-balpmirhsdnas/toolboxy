'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('color-find')!

function makeLevel(level: number) {
  const size = Math.min(2 + Math.floor(level / 2), 8)
  const h = Math.floor(Math.random() * 360), s = 50 + Math.random() * 30, l = 45 + Math.random() * 20
  const diff = Math.max(3, 30 - level * 1.6) // gets harder
  const base = `hsl(${h} ${s}% ${l}%)`
  const odd = `hsl(${h} ${s}% ${l + (Math.random() < 0.5 ? diff : -diff)}%)`
  const oddIdx = Math.floor(Math.random() * size * size)
  return { size, base, odd, oddIdx }
}

export default function ColorFindPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [level, setLevel] = useState(1)
  const [board, setBoard] = useState(() => makeLevel(1))
  const [time, setTime] = useState(30)
  const [over, setOver] = useState(false)
  const [best, setBest] = useState(0)

  const start = useCallback(() => { setLevel(1); setBoard(makeLevel(1)); setTime(30); setOver(false) }, [])
  useEffect(() => { setBest(+(localStorage.getItem('colorfind-best') || 0)) }, [])
  useEffect(() => { if (over) return; const id = setInterval(() => setTime((tm) => { if (tm <= 0.1) { setOver(true); return 0 } return tm - 0.1 }), 100); return () => clearInterval(id) }, [over])
  useEffect(() => { if (over) setBest((b) => { const nb = Math.max(b, level); localStorage.setItem('colorfind-best', String(nb)); return nb }) }, [over]) // eslint-disable-line react-hooks/exhaustive-deps

  function pick(i: number) {
    if (over) return
    if (i === board.oddIdx) { const nl = level + 1; setLevel(nl); setBoard(makeLevel(nl)); setTime((tm) => Math.min(30, tm + 1)) }
    else setTime((tm) => Math.max(0, tm - 3))
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xs mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cf2_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cf2_subtitle')}</p>
        </div>

        <div className="flex justify-between text-sm text-gray-600"><span>{t('cf2_level')}: <b className="text-brand-600">{level}</b></span><span>{t('cf2_time')}: <b>{time.toFixed(0)}s</b></span></div>

        <div className="grid gap-1.5 mx-auto" style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)`, width: 280, height: 280, opacity: over ? 0.3 : 1 }}>
          {Array.from({ length: board.size * board.size }).map((_, i) => (
            <button key={i} onClick={() => pick(i)} className="rounded-md" style={{ background: i === board.oddIdx ? board.odd : board.base }} />
          ))}
        </div>

        {over && <div className="rounded-xl bg-rose-50 text-rose-700 py-3 font-semibold">{t('cf2_over', { level })}</div>}
        <button onClick={start} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{over ? t('cf2_retry') : t('cf2_new')}</button>
        <p className="text-xs text-gray-400">{t('cf2_note')}</p>
      </div>
      <Leaderboard game="color-find" score={best || null} better="higher" />
    </ToolLayout>
  )
}
