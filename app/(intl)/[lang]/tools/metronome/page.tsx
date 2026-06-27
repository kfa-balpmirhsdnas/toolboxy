'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('metronome')!

export default function MetronomePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [bpm, setBpm] = useState(120)
  const [beats, setBeats] = useState(4)
  const [playing, setPlaying] = useState(false)
  const [pulse, setPulse] = useState(-1)
  const ctxRef = useRef<AudioContext | null>(null)
  const noteRef = useRef(0)            // next note time
  const beatRef = useRef(0)            // beat index in measure
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bpmRef = useRef(bpm), beatsRef = useRef(beats)
  bpmRef.current = bpm; beatsRef.current = beats

  function click(time: number, accent: boolean) {
    const ctx = ctxRef.current!
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.frequency.value = accent ? 1500 : 900
    o.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(accent ? 0.5 : 0.3, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
    o.start(time); o.stop(time + 0.06)
  }

  function start() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = ctxRef.current
    ctx.resume()
    noteRef.current = ctx.currentTime + 0.1
    beatRef.current = 0
    setPlaying(true)
    timerRef.current = setInterval(() => {
      const c = ctxRef.current!
      while (noteRef.current < c.currentTime + 0.1) {
        const b = beatRef.current
        click(noteRef.current, b === 0)
        const at = noteRef.current
        setTimeout(() => setPulse(b), Math.max(0, (at - c.currentTime) * 1000))
        noteRef.current += 60 / bpmRef.current
        beatRef.current = (b + 1) % beatsRef.current
      }
    }, 25)
  }
  function stop() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPlaying(false); setPulse(-1)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-sm mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('me_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('me_subtitle')}</p>
        </div>

        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 tabular-nums">{bpm}</div>
          <div className="text-sm text-gray-400">BPM</div>
          <input type="range" min={40} max={240} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full mt-2" />
          <div className="flex justify-center gap-2 mt-2">
            {[-5, -1, 1, 5].map((d) => (
              <button key={d} onClick={() => setBpm((v) => Math.min(240, Math.max(40, v + d)))}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{d > 0 ? `+${d}` : d}</button>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: beats }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-colors ${pulse === i ? (i === 0 ? 'bg-rose-500' : 'bg-brand-500') : 'bg-gray-200'}`} />
          ))}
        </div>

        <label className="flex items-center justify-between text-sm text-gray-600">{t('me_beats')}
          <select value={beats} onChange={(e) => setBeats(+e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}/4</option>)}
          </select>
        </label>

        <button onClick={playing ? stop : start}
          className={`w-full px-5 py-3 font-semibold rounded-xl text-white ${playing ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
          {playing ? `⏸ ${t('me_stop')}` : `▶ ${t('me_start')}`}
        </button>

        <p className="text-xs text-gray-400">{t('me_note')}</p>
      </div>
    </ToolLayout>
  )
}
