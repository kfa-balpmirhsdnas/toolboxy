'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('pomodoro-timer')!
type Mode = 'work' | 'short' | 'long'
const DEFAULTS: Record<Mode, number> = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS: Record<Mode, string> = { work: 'pom_focus', short: 'pom_short', long: 'pom_long' }
const COLORS: Record<Mode, string> = { work: '#6366f1', short: '#10b981', long: '#3b82f6' }
const LS_DUR = 'pom_dur_v1'
const LS_TODAY = 'pom_today_v1' // { date: 'YYYY-MM-DD', count } — resets at midnight
const LS_NOTIF = 'pom_notif_v1'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function PomodoroTimerPage() {
  const t = useTranslations('toolui')
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}
  const [mode, setMode] = useState<Mode>('work')
  const [durations, setDurations] = useState(DEFAULTS)
  const [remaining, setRemaining] = useState(DEFAULTS.work)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0) // completed today (localStorage, midnight reset)
  const [editing, setEditing] = useState(false)
  const [notifOn, setNotifOn] = useState(false)
  const acRef = useRef<AudioContext | null>(null)
  const endAtRef = useRef(0)     // absolute end time — keeps the countdown exact in background tabs
  const baseTitleRef = useRef('')

  // Load persisted settings/state once (read-only; all writes happen in handlers).
  useEffect(() => {
    baseTitleRef.current = document.title
    try {
      const d = JSON.parse(localStorage.getItem(LS_DUR) || 'null')
      if (d && d.work && d.short && d.long) { setDurations(d); setRemaining(d.work) }
    } catch { /* ignore */ }
    try {
      const s = JSON.parse(localStorage.getItem(LS_TODAY) || 'null')
      if (s && s.date === todayStr()) setSessions(s.count || 0)
    } catch { /* ignore */ }
    if (localStorage.getItem(LS_NOTIF) === '1' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setNotifOn(true)
    }
    return () => { document.title = baseTitleRef.current }
  }, [])

  // Tick — recompute from the absolute end timestamp (no drift, survives
  // background-tab throttling) and mirror the countdown into the tab title.
  useEffect(() => {
    if (!running) { document.title = baseTitleRef.current; return }
    const tick = () => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
      setRemaining(left)
      const mm = String(Math.floor(left / 60)).padStart(2, '0')
      const ss = String(left % 60).padStart(2, '0')
      document.title = `(${mm}:${ss}) ${toolNames['pomodoro-timer'] || 'Pomodoro'}`
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // Completion — fires once when the countdown reaches 0 while running.
  useEffect(() => {
    if (!running || remaining > 0) return
    setRunning(false)
    let next: Mode
    if (mode === 'work') {
      const n = sessions + 1
      setSessions(n)
      try { localStorage.setItem(LS_TODAY, JSON.stringify({ date: todayStr(), count: n })) } catch { /* quota */ }
      next = n % 4 === 0 ? 'long' : 'short' // classic cycle: long break every 4th pomodoro
    } else {
      next = 'work'
    }
    beep()
    if (notifOn && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification(toolNames['pomodoro-timer'] || 'Pomodoro', { body: t(mode === 'work' ? 'pom_nwork' : 'pom_nbreak') }) } catch { /* ignore */ }
    }
    setMode(next)
    setRemaining(durations[next])
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
      const startFrom = remaining > 0 ? remaining : durations[mode]
      endAtRef.current = Date.now() + startFrom * 1000
      if (remaining <= 0) setRemaining(startFrom)
    }
    setRunning((v) => !v)
  }
  const switchMode = (m: Mode) => { setMode(m); setRemaining(durations[m]); setRunning(false) }
  const reset = () => { setRemaining(durations[mode]); setRunning(false) }

  // Notification opt-in: permission is requested only when the user turns the
  // toggle on (never on page load).
  function toggleNotif() {
    if (notifOn) {
      setNotifOn(false)
      try { localStorage.setItem(LS_NOTIF, '0') } catch { /* ignore */ }
      return
    }
    if (typeof Notification === 'undefined') return
    Notification.requestPermission().then((p) => {
      if (p === 'granted') {
        setNotifOn(true)
        try { localStorage.setItem(LS_NOTIF, '1') } catch { /* ignore */ }
      }
    })
  }

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
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm text-gray-500">{t('pom_today')} <strong className="text-gray-800">{sessions}</strong></p>
          <button onClick={toggleNotif} title={t('pom_notif')}
            className={'text-sm px-3 py-1.5 rounded-lg border transition-colors ' + (notifOn ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
            {notifOn ? '🔔 ' : '🔕 '}{t('pom_notif')}
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <button onClick={() => setEditing((e) => !e)} className="text-xs text-blue-600 hover:underline mb-2 block">{editing ? t('pom_hide') : t('pom_editdur')}</button>
          {editing && (
            <div className="grid grid-cols-3 gap-2">
              {(['work', 'short', 'long'] as Mode[]).map((m) => (
                <div key={m}><label className="block text-xs text-gray-500 mb-1">{t(LABELS[m])} ({t('pom_min')})</label>
                  <input type="number" value={Math.round(durations[m] / 60)} min="1" max="120"
                    onChange={(e) => {
                      const v = Math.max(1, Number(e.target.value)) * 60
                      setDurations((d) => {
                        const next = { ...d, [m]: v }
                        try { localStorage.setItem(LS_DUR, JSON.stringify(next)) } catch { /* quota */ }
                        return next
                      })
                      if (mode === m) { setRemaining(v); setRunning(false) }
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-center" /></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
