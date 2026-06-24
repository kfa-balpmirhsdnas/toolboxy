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
    d[i] = band * 2.6 * wob
  }
}
function genPencil(d: Float32Array, sr: number) {
  // repeated scratchy strokes: highpassed noise bursts on a writing cadence
  let prev = 0
  const cycle = Math.floor(sr * 0.25) // ~4 strokes/sec
  const stroke = sr * 0.16
  for (let i = 0; i < d.length; i++) {
    const inCycle = i % cycle
    if (inCycle < stroke) {
      const w = Math.random() * 2 - 1
      const s = w - prev // highpass (differentiate)
      prev = w
      d[i] = s * Math.sin(Math.PI * (inCycle / stroke)) * 0.6
    } else {
      prev = 0
      d[i] = 0
    }
  }
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
    setPlaying(true)
    trackToolUsed(tool.slug)
  }, [vol, startSource])

  const stop = useCallback(() => {
    srcRef.current?.stop()
    srcRef.current?.disconnect()
    srcRef.current = null
    setPlaying(false)
  }, [])

  // Pick a sound: switch live if already playing, else just select.
  function pick(id: SoundId) {
    setSel(id)
    selRef.current = id
    if (srcRef.current) startSource(id)
  }

  function changeVol(v: number) {
    setVol(v)
    if (gainRef.current) gainRef.current.gain.value = v
  }

  // Elapsed timer (counts only while playing).
  useEffect(() => {
    if (!playing) return
    const t0 = Date.now() - elapsed * 1000
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 250)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  useEffect(() => () => { srcRef.current?.stop(); ctxRef.current?.close() }, [])

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

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

        <p className="text-xs text-gray-400 text-center">{t('wnm_note')}</p>
      </div>
    </ToolLayout>
  )
}
