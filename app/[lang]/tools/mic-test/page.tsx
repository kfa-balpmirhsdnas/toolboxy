'use client'

import { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('mic-test')!

export default function MicTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [state, setState] = useState<'idle' | 'on' | 'denied'>('idle')
  const [level, setLevel] = useState(0)
  const [peak, setPeak] = useState(0)
  const [label, setLabel] = useState('')
  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef(0)

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setLabel(stream.getAudioTracks()[0]?.label || '')
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const an = ctx.createAnalyser(); an.fftSize = 1024
      src.connect(an)
      const buf = new Uint8Array(an.fftSize)
      setState('on')
      const tick = () => {
        an.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v }
        const rms = Math.sqrt(sum / buf.length)
        const pct = Math.min(100, Math.round(rms * 220))
        setLevel(pct); setPeak((p) => Math.max(p * 0.95, pct))
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      setState('denied')
    }
  }
  function stop() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    ctxRef.current?.close()
    setState('idle'); setLevel(0); setPeak(0)
  }
  useEffect(() => () => { cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach((tr) => tr.stop()) }, [])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('mt_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('mt_subtitle')}</p>
        </div>

        {state === 'on' ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500"><span>{t('mt_level')}</span><span className="tabular-nums">{level}%</span></div>
              <div className="h-6 rounded-full bg-gray-100 overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-lime-400 to-rose-500 transition-[width] duration-75" style={{ width: `${level}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-gray-700" style={{ left: `${peak}%` }} />
              </div>
              <p className="text-xs text-gray-400">{level > 3 ? t('mt_detected') : t('mt_speak')}</p>
            </div>
            {label && <p className="text-xs text-gray-400 truncate">🎙 {label}</p>}
            <button onClick={stop} className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">{t('mt_stop')}</button>
          </>
        ) : state === 'denied' ? (
          <p className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-3">{t('mt_denied')}</p>
        ) : (
          <button onClick={start} className="w-full px-5 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">🎙 {t('mt_start')}</button>
        )}

        <p className="text-xs text-gray-400">{t('mt_note')}</p>
      </div>
    </ToolLayout>
  )
}
