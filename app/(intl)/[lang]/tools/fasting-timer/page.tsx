'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('fasting-timer')!
const KEY = 'toolboxy-fasting'
const PROTOCOLS = [
  { k: '14:10', fast: 14 },
  { k: '16:8', fast: 16 },
  { k: '18:6', fast: 18 },
  { k: '20:4', fast: 20 },
  { k: 'omad', fast: 23 },
]
const pad = (n: number) => String(n).padStart(2, '0')
const fmtDur = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}
const fmtClock = (ms: number, lang: string) =>
  new Date(ms).toLocaleString(lang, { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
const toLocalInput = (ms: number) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function FastingTimerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [fastH, setFastH] = useState(16)
  const [start, setStart] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [notify, setNotify] = useState(false)
  const [sound, setSound] = useState(false)
  const notifRef = useRef({ hour: 0, done: false }) // last hour milestone announced + completion sent
  const audioRef = useRef<AudioContext | null>(null)
  const soundRef = useRef(false); soundRef.current = sound
  const startRef = useRef<number | null>(null); startRef.current = start

  // Restore the running fast (so closing/reopening keeps counting), then tick each second.
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (d?.fastH) setFastH(d.fastH)
      if (d?.start) setStart(d.start)
      if (d?.notify) setNotify(true)
      if (d?.sound) setSound(true)
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ fastH, start, notify, sound })) } catch { /* ignore */ }
  }, [fastH, start, notify, sound])
  // Keep the tick alive across reloads and tab-returns: the AudioContext suspends when the
  // page is hidden (and can't auto-start on load), so resume it on the next gesture / when
  // the page becomes visible again whenever sound is enabled.
  useEffect(() => {
    if (!sound) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AC && !audioRef.current) audioRef.current = new AC()
    } catch { /* ignore */ }
    const resume = () => { audioRef.current?.resume().catch(() => {}) }
    resume()
    const onVis = () => { if (document.visibilityState === 'visible') resume() }
    window.addEventListener('pointerdown', resume)
    document.addEventListener('visibilitychange', onVis)
    return () => { window.removeEventListener('pointerdown', resume); document.removeEventListener('visibilitychange', onVis) }
  }, [sound])
  // A short clock-tick blip on each second (Web Audio, only while a fast is running).
  function playTick() {
    const ctx = audioRef.current; if (!ctx) return
    const o = ctx.createOscillator(); const g = ctx.createGain(); const t0 = ctx.currentTime
    o.type = 'triangle'; o.frequency.value = 700 // lower, softer tick
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.001)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04)
    o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.04)
  }
  useEffect(() => {
    const id = setInterval(() => { setNow(Date.now()); if (soundRef.current && startRef.current) playTick() }, 1000)
    return () => clearInterval(id)
  }, [])

  const fastMs = fastH * 3600000
  const eatH = 24 - fastH
  const elapsed = start ? now - start : 0
  const fasting = !!start && elapsed < fastMs
  const fastEnd = start ? start + fastMs : 0
  const eatEnd = start ? fastEnd + eatH * 3600000 : 0
  const remaining = fasting ? fastMs - elapsed : start ? eatEnd - now : 0
  const progress = start ? Math.min(1, elapsed / fastMs) : 0
  const pct = Math.round(progress * 100)

  // Seed the milestone tracker from the current fast so old hours aren't re-announced.
  useEffect(() => {
    if (!start) { notifRef.current = { hour: 0, done: false }; return }
    const el = Date.now() - start
    notifRef.current = { hour: el < fastMs ? Math.floor(el / 3600000) : 0, done: el >= fastMs }
  }, [start, fastMs])

  // Hourly + completion notifications (best-effort: fires while the app is running).
  useEffect(() => {
    if (!notify || !start || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const el = now - start
    if (el < fastMs) {
      const h = Math.floor(el / 3600000)
      if (h >= 1 && h > notifRef.current.hour) {
        notifRef.current.hour = h
        try { new Notification('ToolBoxy', { body: t('if_notify_hour', { h }), icon: '/icon-192.png' }) } catch { /* ignore */ }
      }
    } else if (!notifRef.current.done) {
      notifRef.current.done = true
      try { new Notification('ToolBoxy', { body: t('if_notify_done'), icon: '/icon-192.png' }) } catch { /* ignore */ }
    }
  }, [now, notify, start, fastMs, t])

  const onStartChange = (v: string) => { const ms = new Date(v).getTime(); if (!Number.isNaN(ms)) setStart(ms) }
  const reset = () => { if (window.confirm(t('if_reset_confirm'))) setStart(null) }
  const toggleNotify = async () => {
    if (notify) { setNotify(false); return }
    if (typeof Notification === 'undefined') { alert(t('if_notify_unsupported')); return }
    let perm = Notification.permission
    if (perm === 'default') perm = await Notification.requestPermission()
    if (perm === 'granted') setNotify(true)
    else alert(t('if_notify_denied'))
  }
  // The [sound] effect handles AudioContext creation/resume (this click is the unlocking gesture).
  const toggleSound = () => setSound((s) => !s)

  const R = 112
  const C = 2 * Math.PI * R
  const ringP = start ? (fasting ? progress : 1) : 0
  const accent = fasting || !start ? '#059669' : '#f59e0b'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        {/* Protocol picker */}
        <div className="grid grid-cols-5 gap-1.5">
          {PROTOCOLS.map((p) => (
            <button key={p.k} onClick={() => setFastH(p.fast)}
              className={'py-2 rounded-xl text-xs font-bold transition ' + (fastH === p.fast ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {p.k === 'omad' ? t('if_omad') : p.k}
            </button>
          ))}
        </div>

        {/* Progress ring — the headline element */}
        <div className="relative mx-auto" style={{ width: 256, height: 256 }}>
          <svg viewBox="0 0 256 256" className="w-full h-full -rotate-90">
            <circle cx="128" cy="128" r={R} fill="none" stroke="#e5e7eb" strokeWidth="14" />
            <circle cx="128" cy="128" r={R} fill="none" stroke={accent} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - ringP)} style={{ transition: 'stroke-dashoffset .5s, stroke .5s' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {start ? (
              <>
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: accent }}>
                  {fasting ? t('if_status_fasting') : t('if_status_eating')}
                </p>
                <p className="text-4xl font-bold font-mono text-gray-800 tabular-nums leading-tight">{fmtDur(fasting ? elapsed : remaining)}</p>
                {fasting ? (
                  <p className="text-sm text-gray-500 tabular-nums"><span className="font-mono">{fmtDur(remaining)}</span> {t('if_leftshort')} · <b style={{ color: accent }}>{pct}%</b></p>
                ) : (
                  <p className="text-sm text-gray-400">{t('if_eatleft')}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center px-8">{t('if_idle')}</p>
            )}
          </div>
        </div>

        {/* Alert + tick-sound toggles */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={toggleNotify}
            className={'flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ' + (notify ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
            {notify ? '🔔' : '🔕'} {t(notify ? 'if_notify_on' : 'if_notify_off')}
          </button>
          <button onClick={toggleSound}
            className={'flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ' + (sound ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
            {sound ? '🔊' : '🔇'} {t(sound ? 'if_sound_on' : 'if_sound_off')}
          </button>
        </div>

        {/* Actions / status */}
        {!start ? (
          <button onClick={() => setStart(Date.now())}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition">{t('if_startnow')}</button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{t('if_canEat')}</p>
                <p className="font-bold text-emerald-700 text-sm">{fmtClock(fastEnd, params.lang)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{t('if_nextFast')}</p>
                <p className="font-bold text-amber-700 text-sm">{fmtClock(eatEnd, params.lang)}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('if_started')}</label>
              <input type="datetime-local" value={toLocalInput(start)} onChange={(e) => onStartChange(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            {!fasting && <p className="text-center text-sm font-medium text-amber-600">🎉 {t('if_done')}</p>}
            <button onClick={reset} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition">{t('if_reset')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('if_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
