'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('number-order')!
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

export default function NumberOrderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [nums, setNums] = useState<number[]>([])
  const [next, setNext] = useState(1)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState<number | null>(null)

  const reset = useCallback(() => { setNums(shuffle(Array.from({ length: 25 }, (_, i) => i + 1))); setNext(1); setTime(0); setRunning(false) }, [])
  useEffect(() => { reset(); const b = localStorage.getItem('numorder-best'); if (b) setBest(+b) }, [reset])
  useEffect(() => { if (!running) return; const id = setInterval(() => setTime((t) => t + 0.1), 100); return () => clearInterval(id) }, [running])

  function click(n: number) {
    if (n !== next) return
    if (n === 1) setRunning(true)
    if (n === 25) { setRunning(false); setBest((b) => { const nb = b === null ? time : Math.min(b, time); localStorage.setItem('numorder-best', String(nb)); return nb }) }
    setNext((x) => x + 1)
  }
  const done = next > 25

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xs mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('no_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('no_subtitle')}</p>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('no_next')}: <b className="text-brand-600">{done ? '✓' : next}</b></span>
          <span>{t('no_time')}: <b>{time.toFixed(1)}s</b></span>
          {best !== null && <span>{t('no_best')}: <b>{best.toFixed(1)}s</b></span>}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {nums.map((n) => (
            <button key={n} onClick={() => click(n)} disabled={n < next}
              className={`aspect-square rounded-lg text-lg font-bold ${n < next ? 'bg-emerald-100 text-emerald-400' : 'bg-gray-100 text-gray-800 hover:bg-brand-100'}`}>{n}</button>
          ))}
        </div>

        {done && <div className="rounded-xl bg-emerald-50 text-emerald-700 py-3 font-semibold">{t('no_done', { time: time.toFixed(1) })}</div>}
        <button onClick={reset} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('no_new')}</button>
      </div>
      <Leaderboard game="number-order" score={best != null ? Math.round(best * 10) / 10 : null} unit=" s" better="lower" />
    </ToolLayout>
  )
}
