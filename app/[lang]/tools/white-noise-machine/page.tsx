'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('white-noise-machine')!

type SoundId = 'white' | 'pink' | 'brown' | 'rain' | 'fire' | 'ocean' | 'fan' | 'pencil'

const SOUNDS: { id: SoundId; emoji: string; seconds: number }[] = [
  { id: 'white', emoji: '⚪', seconds: 4 },
  { id: 'pink', emoji: '🌸', seconds: 4 },
  { id: 'brown', emoji: '🟤', seconds: 4 },
  { id: 'rain', emoji: '🌧️', seconds: 4 },
  { id: 'fire', emoji: '🔥', seconds: 5 },
  { id: 'ocean', emoji: '🌊', seconds: 9 }, // one full swell → seamless loop
  { id: 'fan', emoji: '🌀', seconds: 4 },
  { id: 'pencil', emoji: '✏️', seconds: 4 },
]

const SLEEP = [0, 5, 10, 15, 30, 45, 60] // sleep-timer minutes (0 = off)

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// --- Procedural noise generators (fill a mono Float32Array in-place) ---------
function genWhite(d: Float32Array) {
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
}
function genPink(d: Float32Array) {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856
    b4 = 0.55000 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.0168980
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
}
function genBrown(d: Float32Array) {
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    d[i] = last * 3.5
  }
}
function genRain(d: Float32Array, sr: number) {
  let lp = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    lp += 0.06 * (w - lp) // one-pole lowpass → soft hiss
    d[i] = lp * 2.2
  }
  // sparse droplet transients
  const drops = Math.floor((d.length / sr) * 28)
  for (let k = 0; k < drops; k++) {
    const pos = Math.floor(Math.random() * d.length)
    const len = Math.floor(sr * 0.01 * (0.5 + Math.random()))
    for (let j = 0; j < len && pos + j < d.length; j++) {
      d[pos + j] += (Math.random() * 2 - 1) * Math.exp(-j / (len * 0.3)) * 0.28
    }
  }
}
function genFire(d: Float32Array, sr: number) {
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    d[i] = last * 1.8 // low rumble
  }
  // random crackle pops
  const pops = Math.floor((d.length / sr) * 14)
  for (let k = 0; k < pops; k++) {
    const pos = Math.floor(Math.random() * d.length)
    const len = Math.floor(sr * 0.008 * (0.3 + Math.random() * 2))
    const amp = 0.3 + Math.random() * 0.5
    for (let j = 0; j < len && pos + j < d.length; j++) {
      d[pos + j] += (Math.random() * 2 - 1) * Math.exp(-j / (len * 0.25)) * amp
    }
  }
}
function genOcean(d: Float32Array) {
  // one wave per buffer; sin² envelope → 0 at both ends = seamless loop
  let last = 0
  const n = d.length
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.025 * w) / 1.025
    const env = Math.pow(Math.sin(Math.PI * (i / n)), 2)
    d[i] = last * 3.4 * env
  }
}
function genFan(d: Float32Array, sr: number) {
  let lp = 0, hp = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    lp += 0.08 * (w - lp)
    hp += 0.002 * (lp - hp)
    const band = lp - hp // crude bandpass
    const wob = 0.85 + 0.15 * Math.sin((2 * Math.PI * i * 0.6) / sr) // motor whirr
    d[i] = band * 0.95 * wob
  }
}
function genPencil(d: Float32Array, sr: number) {
  // Soft, grainy writing strokes at a natural cadence (~2 strokes/sec) with
  // randomized stroke length, gaps, and loudness — not harsh high-freq static.
  let lp = 0
  let pos = 0
  while (pos < d.length) {
    const strokeLen = Math.floor(sr * (0.16 + Math.random() * 0.14)) // 0.16–0.30s
    const gapLen = Math.floor(sr * (0.10 + Math.random() * 0.18))    // 0.10–0.28s
    const amp = 0.5 + Math.random() * 0.5
    for (let j = 0; j < strokeLen && pos < d.length; j++, pos++) {
      const w = Math.random() * 2 - 1
      lp += 0.55 * (w - lp) // higher cutoff → thin, fine scratch
      d[pos] = lp * Math.sin(Math.PI * (j / strokeLen)) * amp * 0.095 // very quiet, subtle scratch
    }
    for (let j = 0; j < gapLen && pos < d.length; j++, pos++) { lp += 0.18 * (0 - lp); d[pos] = 0 }
  }
  // Fade the loop tail so the random cut doesn't click.
  const fade = Math.min(d.length, Math.floor(sr * 0.03))
  for (let j = 0; j < fade; j++) d[d.length - 1 - j] *= j / fade
}

function fillBuffer(id: SoundId, d: Float32Array, sr: number) {
  switch (id) {
    case 'white': return genWhite(d)
    case 'pink': return genPink(d)
    case 'brown': return genBrown(d)
    case 'rain': return genRain(d, sr)
    case 'fire': return genFire(d, sr)
    case 'ocean': return genOcean(d)
    case 'fan': return genFan(d, sr)
    case 'pencil': return genPencil(d, sr)
  }
}

export default function WhiteNoiseMachinePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [sel, setSel] = useState<SoundId>('rain')
  const [playing, setPlaying] = useState(false)
  const [vol, setVol] = useState(0.5)
  const [elapsed, setElapsed] = useState(0)
  const [sleepMin, setSleepMin] = useState(0) // 0 = off; auto-stop after N minutes

  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const srcRef = useRef<AudioBufferSourceNode | null>(null)
  const bufCache = useRef<Map<SoundId, AudioBuffer>>(new Map())
  const selRef = useRef(sel); selRef.current = sel

  const getBuffer = useCallback((ctx: AudioContext, id: SoundId): AudioBuffer => {
    const cached = bufCache.current.get(id)
    if (cached) return cached
    const meta = SOUNDS.find((s) => s.id === id)!
    const len = Math.floor(ctx.sampleRate * meta.seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    fillBuffer(id, buf.getChannelData(0), ctx.sampleRate)
    bufCache.current.set(id, buf)
    return buf
  }, [])

  const startSource = useCallback((id: SoundId) => {
    const ctx = ctxRef.current!
    srcRef.current?.stop()
    srcRef.current?.disconnect()
    const src = ctx.createBufferSource()
    src.buffer = getBuffer(ctx, id)
    src.loop = true
    src.connect(gainRef.current!)
    src.start()
    srcRef.current = src
  }, [getBuffer])

  const start = useCallback(() => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx
    if (!gainRef.current) {
      const g = ctx.createGain()
      g.gain.value = vol
      g.connect(ctx.destination)
      gainRef.current = g
    }
    ctx.resume()
    startSource(selRef.current)
    setElapsed(0)
    setPlaying(true)
    trackToolUsed(tool.slug)
  }, [vol, startSource])

  const stop = useCallback(() => {
    srcRef.current?.stop()
    srcRef.current?.disconnect()
    srcRef.current = null
    setPlaying(false)
  }, [])

  // Short UI "tick" when a tile is pressed (fixed level, independent of volume).
  const clickBlip = useCallback(() => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx
    ctx.resume()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1100, now)
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.04)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
    osc.connect(g).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.08)
  }, [])

  // Pick a sound: play a click, then switch live if playing, else start playback.
  function pick(id: SoundId) {
    clickBlip()
    setSel(id)
    selRef.current = id
    if (srcRef.current) startSource(id)
    else start()
  }

  function changeVol(v: number) {
    setVol(v)
    if (gainRef.current) gainRef.current.gain.value = v
  }

  // Elapsed timer (counts only while playing) + sleep-timer auto-stop.
  useEffect(() => {
    if (!playing) return
    const t0 = Date.now() - elapsed * 1000
    const id = window.setInterval(() => {
      const e = Math.floor((Date.now() - t0) / 1000)
      setElapsed(e)
      if (sleepMin > 0 && e >= sleepMin * 60) stop()
    }, 250)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sleepMin])

  useEffect(() => () => { srcRef.current?.stop(); ctxRef.current?.close() }, [])

  const mmss = fmt(elapsed)
  const remaining = sleepMin > 0 ? Math.max(0, sleepMin * 60 - elapsed) : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        {/* Sound picker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SOUNDS.map((s) => (
            <button key={s.id} onClick={() => pick(s.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                sel === s.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400'
              }`}>
              <span className="text-2xl leading-none">{s.emoji}</span>
              <span>{t(`wnm_${s.id}`)}</span>
            </button>
          ))}
        </div>

        {/* Elapsed time */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-gray-400">{t('wnm_elapsed')}</div>
          <div className={`font-mono tabular-nums text-5xl font-bold ${playing ? 'text-brand-700' : 'text-gray-300'}`}>{mmss}</div>
          {remaining !== null && playing && (
            <div className="text-sm text-gray-400 mt-1">💤 {t('wnm_until')} {fmt(remaining)}</div>
          )}
        </div>

        {/* Play / Stop */}
        <button onClick={playing ? stop : start}
          className={`w-full py-3.5 text-base font-semibold rounded-xl text-white transition-colors ${
            playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
          }`}>
          {playing ? `■ ${t('wnm_stop')}` : `▶ ${t('wnm_play')}`}
        </button>

        {/* Volume */}
        <div>
          <label className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>🔊 {t('wnm_volume')}</span>
            <span className="tabular-nums text-gray-400">{Math.round(vol * 100)}%</span>
          </label>
          <input type="range" min={0} max={1} step={0.01} value={vol}
            onChange={(e) => changeVol(+e.target.value)} className="w-full accent-brand-600" />
        </div>

        {/* Sleep timer */}
        <label className="flex items-center justify-between text-sm text-gray-600">
          <span>💤 {t('wnm_sleep')}</span>
          <select value={sleepMin} onChange={(e) => setSleepMin(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            {SLEEP.map((m) => <option key={m} value={m}>{m === 0 ? t('wnm_off') : `${m}${t('wnm_min')}`}</option>)}
          </select>
        </label>

        <p className="text-xs text-gray-400 text-center">{t('wnm_note')}</p>
      </div>
    </ToolLayout>
  )
}
