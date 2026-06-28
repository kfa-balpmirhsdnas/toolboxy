'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { SoundToggle } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('reaction-time-test')!

type Phase = 'idle' | 'waiting' | 'go' | 'early'

export default function ReactionTimeTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('games')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<number | null>(null)
  const [best, setBest] = useState<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = useRef(0)

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  function handleClick() {
    if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setPhase('early')
    } else if (phase === 'go') {
      const ms = Date.now() - startRef.current
      setResult(ms)
      setBest((b) => (b == null || ms < b ? ms : b))
      setPhase('idle')
    } else {
      // idle / early -> start a new round
      setResult(null)
      setPhase('waiting')
      trackToolUsed('reaction-time-test')
      timeoutRef.current = setTimeout(() => {
        startRef.current = Date.now()
        setPhase('go')
      }, 1500 + Math.random() * 3000)
    }
  }

  const box = {
    idle: { bg: 'bg-brand-600', title: result != null ? `${result} ${t('rt_unit')}` : t('rt_title'), sub: result != null ? t('rt_again') : t('rt_start') },
    waiting: { bg: 'bg-red-500', title: t('rt_wait'), sub: t('rt_dont') },
    go: { bg: 'bg-green-500', title: t('rt_click'), sub: '' },
    early: { bg: 'bg-gray-700', title: t('rt_toosoon'), sub: t('rt_again') },
  }[phase]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="relative space-y-4">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <button onClick={handleClick}
          className={`w-full h-64 rounded-2xl text-white flex flex-col items-center justify-center select-none transition-colors ${box.bg}`}>
          <span className="text-3xl font-bold">{box.title}</span>
          {box.sub && <span className="text-sm mt-2 opacity-90">{box.sub}</span>}
        </button>

        {best != null && (
          <div className="text-center text-sm text-gray-600">
            {t('best')}: <span className="font-bold text-brand-700">{best} {t('rt_unit')}</span>
          </div>
        )}
        <p className="text-center text-xs text-gray-400">
          {t('rt_hint')}
        </p>
      </div>

      <Leaderboard game="reaction-time-test" score={best} unit=" ms" better="lower" />
    </ToolLayout>
  )
}
