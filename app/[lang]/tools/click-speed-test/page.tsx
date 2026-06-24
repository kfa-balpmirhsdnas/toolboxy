'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('click-speed-test')!
const DURATION = 5 // seconds

type Phase = 'idle' | 'running' | 'done'

export default function ClickSpeedTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('games')
  const [phase, setPhase] = useState<Phase>('idle')
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [best, setBest] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const runningRef = useRef(false)
  const clicksRef = useRef(0)

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const cps = +(clicks / DURATION).toFixed(1)

  function click() {
    if (phase === 'done') return
    if (!runningRef.current) {
      // first click starts the timer
      runningRef.current = true
      clicksRef.current = 1
      setClicks(1)
      setPhase('running')
      setTimeLeft(DURATION)
      trackToolUsed('click-speed-test')
      const startedAt = Date.now()
      intervalRef.current = setInterval(() => {
        const left = DURATION - (Date.now() - startedAt) / 1000
        if (left <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          runningRef.current = false
          setTimeLeft(0)
          setPhase('done')
          const final = +(clicksRef.current / DURATION).toFixed(1)
          setBest((b) => (b == null || final > b ? final : b))
        } else {
          setTimeLeft(+left.toFixed(1))
        }
      }, 100)
    } else {
      clicksRef.current += 1
      setClicks(clicksRef.current)
    }
  }

  function reset() { runningRef.current = false; clicksRef.current = 0; setPhase('idle'); setClicks(0); setTimeLeft(DURATION) }

  const box = {
    idle: { bg: 'bg-brand-600', title: t('cps_title'), sub: t('cps_start', { seconds: DURATION }) },
    running: { bg: 'bg-green-500', title: `${clicks}`, sub: t('cps_running', { time: timeLeft.toFixed(1) }) },
    done: { bg: 'bg-gray-700', title: `${cps} ${t('cps_unit')}`, sub: t('cps_done', { clicks, seconds: DURATION }) },
  }[phase]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <button onClick={click}
          className={`w-full h-64 rounded-2xl text-white flex flex-col items-center justify-center select-none transition-colors ${box.bg}`}>
          <span className="text-4xl font-bold">{box.title}</span>
          <span className="text-sm mt-2 opacity-90">{box.sub}</span>
        </button>

        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          {best != null && <span>{t('best')}: <span className="font-bold text-brand-700">{best} {t('cps_unit')}</span></span>}
          {phase === 'done' && <button onClick={reset} className="px-4 py-1.5 rounded-lg border border-gray-200 hover:border-brand-400">{t('tryAgain')}</button>}
        </div>
        <p className="text-center text-xs text-gray-400">{t('cps_hint')}</p>
      </div>

      <Leaderboard game="click-speed-test" score={best} unit=" CPS" better="higher" />
    </ToolLayout>
  )
}
