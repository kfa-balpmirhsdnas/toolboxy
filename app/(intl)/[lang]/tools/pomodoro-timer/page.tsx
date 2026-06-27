'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('pomodoro-timer')!
type Mode = 'work' | 'short' | 'long'
const DEFAULTS: Record<Mode, number> = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS: Record<Mode, string> = { work: 'pom_focus', short: 'pom_short', long: 'pom_long' }
const COLORS: Record<Mode, string> = { work: '#6366f1', short: '#10b981', long: '#3b82f6' }

export default function PomodoroTimerPage() {
  const t = useTranslations('toolui')
  const [mode, setMode] = useState<Mode>('work')
  const [durations, setDurations] = useState(DEFAULTS)
  const [remaining, setRemaining] = useState(DEFAULTS.work)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [editing, setEditing] = useState(false)
  const acRef = useRef<AudioContext | null>(null)

  // Tick: the interval only decrements. Completion is handled separately so we
  // never run side effects (sound, state changes) inside a setState updater.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [running])

  // Completion — fires once when the countdown reaches 0 while running.
  useEffect(() => {
    if (!running || remaining > 0) return
    setRunning(false)
    if (mode === 'work') setSessions((s) => s + 1)
    beep()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running])

  // A short alarm via the Web Audio API. The context is unlocked on the Start
  // click (user gesture) so it can still play when the timer finishes later.
  function ensureAudio() {
    try {
      if (!acRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        acRef.current = new AC()
      }
      if (acRef.current.state === 'suspended') acRef.current.resume()
    } catch { /* ignore */ }
  }
  function beep() {
    const ctx = acRef.current
    if (!ctx) return
    try {
      const now = ctx.currentTime
      for (let i = 0; i < 2; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.type = 'sine'; o.frequency.value = 880
        const t0 = now + i * 0.35
        g.gain.setValueAtTime(0.0001, t0)
        g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3)
        o.start(t0); o.stop(t0 + 0.32)
      }
    } catch { /* ignore */ }
  }

  function toggle() {
    if (!running) {
      ensureAudio()
      if (remaining <= 0) setRemaining(durations[mode]) // restart a finished timer
    }
    setRunning((v) => !v)
  }
  const switchMode = (m: Mode) => { setMode(m); setRemaining(durations[m]); setRunning(false) }
  const reset = () => { setRemaining(durations[mode]); setRunning(false) }

  const min = Math.floor(remaining / 60), sec = remaining % 60
  const pct = (1 - remaining / durations[mode]) * 100
  const r = 90, circ = 2 * Math.PI * r
  const dash = circ * (1 - pct / 100)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['work', 'short', 'long'] as Mode[]).map((m) => (
            <button key={m} onClick={() => switchMode(m)}
              className={'flex-1 py-2 text-sm font-medium transition ' + (mode === m ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}
              style={mode === m ? { background: COLORS[m] } : {}}>
              {t(LABELS[m])}
            </button>
          ))}
        </div>
        <div className="relative flex justify-center">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle cx="110" cy="110" r={r} fill="none" stroke={COLORS[mode]} strokeWidth="12" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold font-mono tabular-nums">{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</p>
            <p className="text-sm text-gray-500 mt-1">{t(LABELS[mode])}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition">{t('ic_reset')}</button>
          <button onClick={toggle}
            className="px-10 py-3 rounded-xl font-bold text-white text-lg transition"
            style={{ background: COLORS[mode] }}>
            {running ? t('sw_pause') : t('sw_start')}
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">{t('pom_sessions')} <strong className="text-gray-800">{sessions}</strong></p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <button onClick={() => setEditing((e) => !e)} className="text-xs text-blue-600 hover:underline mb-2 block">{editing ? t('pom_hide') : t('pom_editdur')}</button>
          {editing && (
            <div className="grid grid-cols-3 gap-2">
              {(['work', 'short', 'long'] as Mode[]).map((m) => (
                <div key={m}><label className="block text-xs text-gray-500 mb-1">{t(LABELS[m])} ({t('pom_min')})</label>
                  <input type="number" value={Math.round(durations[m] / 60)} min="1" max="60"
                    onChange={(e) => { const v = Math.max(1, Number(e.target.value)) * 60; setDurations((d) => ({ ...d, [m]: v })); if (mode === m) { setRemaining(v); setRunning(false) } }}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-center" /></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
