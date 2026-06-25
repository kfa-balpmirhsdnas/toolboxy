'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('speaker-test')!

export default function SpeakerTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const ctxRef = useRef<AudioContext | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)

  function play(pan: number, key: string) {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = ctxRef.current
    ctx.resume()
    const o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner()
    o.type = 'sine'; o.frequency.value = 440
    p.pan.value = pan
    o.connect(g); g.connect(p); p.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.25, now + 0.05)
    g.gain.setValueAtTime(0.25, now + 1.0)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    o.start(now); o.stop(now + 1.25)
    setPlaying(key)
    setTimeout(() => setPlaying((k) => (k === key ? null : k)), 1200)
  }

  const Btn = ({ pan, k, label, emoji }: { pan: number; k: string; label: string; emoji: string }) => (
    <button onClick={() => play(pan, k)}
      className={`flex-1 flex flex-col items-center gap-2 py-8 rounded-2xl border-2 transition-colors ${playing === k ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
      <span className={`text-4xl ${playing === k ? 'animate-pulse' : ''}`}>{emoji}</span>
      <span className="font-semibold text-gray-700">{label}</span>
    </button>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sp_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sp_subtitle')}</p>
        </div>

        <div className="flex gap-3">
          <Btn pan={-1} k="L" label={t('sp_left')} emoji="🔈" />
          <Btn pan={0} k="C" label={t('sp_both')} emoji="🔊" />
          <Btn pan={1} k="R" label={t('sp_right')} emoji="🔉" />
        </div>

        <p className="text-xs text-gray-400">{t('sp_note')}</p>
      </div>
    </ToolLayout>
  )
}
