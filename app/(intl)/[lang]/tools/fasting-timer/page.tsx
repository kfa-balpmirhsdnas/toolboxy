'use client'
import { useState, useEffect } from 'react'
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

  // Restore the running fast (so closing/reopening keeps counting), then tick each second.
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (d?.fastH) setFastH(d.fastH)
      if (d?.start) setStart(d.start)
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ fastH, start })) } catch { /* ignore */ }
  }, [fastH, start])
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
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

  const R = 86
  const C = 2 * Math.PI * R
  const ringP = start ? (fasting ? progress : 1) : 0
  const accent = fasting || !start ? '#059669' : '#f59e0b'

  const onStartChange = (v: string) => { const ms = new Date(v).getTime(); if (!Number.isNaN(ms)) setStart(ms) }

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

        {/* Progress ring */}
        <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle cx="100" cy="100" r={R} fill="none" stroke={accent} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - ringP)} style={{ transition: 'stroke-dashoffset .5s, stroke .5s' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {start ? (
              <>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>
                  {fasting ? t('if_status_fasting') : t('if_status_eating')}
                </p>
                <p className="text-3xl font-bold font-mono text-gray-800 tabular-nums">{fmtDur(fasting ? elapsed : remaining)}</p>
                <p className="text-xs text-gray-400">{fasting ? t('if_of', { h: fastH }) : t('if_eatleft')}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center px-6">{t('if_idle')}</p>
            )}
          </div>
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
            {fasting ? (
              <p className="text-center text-xs text-gray-500">{t('if_remaining')}: <b className="font-mono">{fmtDur(remaining)}</b> · {Math.round(progress * 100)}%</p>
            ) : (
              <p className="text-center text-sm font-medium text-amber-600">🎉 {t('if_done')}</p>
            )}
            <button onClick={() => setStart(null)} className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition">{t('if_reset')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('if_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
