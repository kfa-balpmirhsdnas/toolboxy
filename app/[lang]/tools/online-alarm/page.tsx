'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('online-alarm')!

export default function OnlineAlarmPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [time, setTime] = useState('')
  const [label, setLabel] = useState('')
  const [armed, setArmed] = useState(false)
  const [ringing, setRinging] = useState(false)
  const [remain, setRemain] = useState('')
  const ctxRef = useRef<AudioContext | null>(null)
  const beepRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function beep() {
    const ctx = ctxRef.current
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = 880
    o.connect(g); g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.setValueAtTime(0.001, now)
    g.gain.exponentialRampToValueAtTime(0.4, now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    o.start(now); o.stop(now + 0.42)
  }

  // tick: check time + update remaining
  useEffect(() => {
    if (!armed) return
    const id = setInterval(() => {
      const n = new Date()
      const cur = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
      if (cur === time && n.getSeconds() === 0) { setArmed(false); setRinging(true); return }
      const [h, m] = time.split(':').map(Number)
      const tgt = new Date(n); tgt.setHours(h, m, 0, 0)
      if (tgt.getTime() <= n.getTime()) tgt.setDate(tgt.getDate() + 1)
      const s = Math.round((tgt.getTime() - n.getTime()) / 1000)
      setRemain(`${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`)
    }, 250)
    return () => clearInterval(id)
  }, [armed, time])

  // ringing: loop beep
  useEffect(() => {
    if (!ringing) return
    beep()
    beepRef.current = setInterval(beep, 800)
    return () => { if (beepRef.current) clearInterval(beepRef.current) }
  }, [ringing])

  function arm() {
    if (!time) return
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    ctxRef.current.resume()
    setRinging(false); setArmed(true)
  }
  function stop() { setRinging(false); setArmed(false) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('al_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('al_subtitle')}</p>
        </div>

        {ringing ? (
          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-8 text-center animate-pulse">
            <div className="text-6xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-rose-700">{label || t('al_ringing')}</div>
            <button onClick={stop} className="mt-4 px-8 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700">{t('al_stop')}</button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm text-gray-600">{t('al_time')}
                <input value={time} onChange={(e) => setTime(e.target.value)} type="time"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-2xl tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-600">{t('al_label')}
                <input value={label} onChange={(e) => setLabel(e.target.value)} type="text" placeholder={t('al_label_ph')}
                  autoComplete="off" data-1p-ignore data-lpignore="true"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </label>
            </div>

            {armed ? (
              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
                <div className="text-sm text-brand-700">{t('al_remaining')}</div>
                <div className="text-4xl font-bold text-brand-700 tabular-nums mt-1">{remain || '—'}</div>
                <button onClick={stop} className="mt-3 px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-white">{t('al_cancel')}</button>
              </div>
            ) : (
              <button onClick={arm} disabled={!time}
                className="w-full px-5 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{t('al_set')}</button>
            )}
          </>
        )}

        <p className="text-xs text-gray-400">{t('al_note')}</p>
      </div>
    </ToolLayout>
  )
}
