'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('tone-generator')!

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export default function ToneGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [freq, setFreq] = useState(440)
  const [wave, setWave] = useState<Wave>('sine')
  const [vol, setVol] = useState(0.3)
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  function play() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.value = freq
    gain.gain.value = vol
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    oscRef.current = osc
    gainRef.current = gain
    setPlaying(true)
    trackToolUsed('tone-generator')
  }

  function stop() {
    oscRef.current?.stop()
    oscRef.current?.disconnect()
    oscRef.current = null
    setPlaying(false)
  }

  function update(f: number, w: Wave, v: number) {
    setFreq(f); setWave(w); setVol(v)
    if (oscRef.current && gainRef.current) {
      oscRef.current.frequency.value = f
      oscRef.current.type = w
      gainRef.current.gain.value = v
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-5xl font-bold text-brand-700 tabular-nums">{freq} <span className="text-2xl text-gray-400">Hz</span></div>
        </div>

        <div>
          <input type="range" min={20} max={20000} step={1} value={freq} onChange={(e) => update(+e.target.value, wave, vol)} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>20 Hz</span><span>20 kHz</span></div>
          <input type="number" min={20} max={20000} value={freq} onChange={(e) => update(+e.target.value || 20, wave, vol)}
            className="mt-2 w-32 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as Wave[]).map((w) => (
            <button key={w} onClick={() => update(freq, w, vol)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                wave === w ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{t('tg_'+w)}</button>
          ))}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('tg_volume')} {Math.round(vol * 100)}%</label>
          <input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => update(freq, wave, +e.target.value)} className="w-full" />
        </div>

        <button onClick={playing ? stop : play}
          className={`w-full py-3 text-sm font-semibold rounded-xl text-white transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
          {playing ? '■ '+t('tg_stop') : '▶ '+t('tg_play')}
        </button>
        <p className="text-xs text-gray-400">{t('tg_warn')}</p>
      </div>

    </ToolLayout>
  )
}
