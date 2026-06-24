'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { CHEONSUGYEONG, type SutraLine } from '@/lib/scriptures/cheonsugyeong'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('cheonsugyeong')!
const LINES = CHEONSUGYEONG
const RATES = [0.7, 0.85, 1, 1.15, 1.3]

interface Section { no: number; ko: string; hanja: string; type: string; lines: SutraLine[] }
const SECTIONS: Section[] = (() => {
  const s: Section[] = []
  for (const l of LINES) {
    const cur = s[s.length - 1]
    if (!cur || cur.no !== l.section) s.push({ no: l.section, ko: l.sectionKo, hanja: l.sectionHanja, type: l.type, lines: [l] })
    else cur.lines.push(l)
  }
  return s
})()

export default function CheonsugyeongPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [showHanja, setShowHanja] = useState(false)
  const [showReading, setShowReading] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [curOrder, setCurOrder] = useState<number | null>(null)
  const [rate, setRate] = useState(1)

  const genRef = useRef(0)
  const idxRef = useRef(0)
  const rateRef = useRef(rate); rateRef.current = rate
  const watchdog = useRef<number | null>(null)

  const scrollToOrder = (order: number) => {
    document.querySelector(`[data-order="${order}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const stopAll = useCallback(() => {
    genRef.current++
    if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [])

  const speakFrom = useCallback((startIdx: number) => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    const myGen = ++genRef.current
    const alive = () => genRef.current === myGen
    synth?.cancel()

    const speakLine = (i: number) => {
      if (!alive()) return
      if (i >= LINES.length) { setPlaying(false); setCurOrder(null); return }
      const line = LINES[i]
      if (!line.reading) { speakLine(i + 1); return }
      idxRef.current = i
      setCurOrder(line.order)
      scrollToOrder(line.order)
      const reps = Math.max(1, line.repeat)
      let rep = 0
      const once = () => {
        if (!alive()) return
        const u = new SpeechSynthesisUtterance(line.reading)
        u.lang = 'ko-KR'; u.rate = rateRef.current
        let done = false
        const proceed = () => {
          if (done || !alive()) return
          done = true
          if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
          rep++
          if (rep < reps) once()
          else speakLine(i + 1)
        }
        u.onend = proceed; u.onerror = proceed
        synth.speak(u)
        // Advance even if the device has no Korean TTS voice (onend never fires).
        watchdog.current = window.setTimeout(proceed, Math.min(15000, line.reading.length * 220 + 2500))
      }
      once()
    }
    speakLine(startIdx)
  }, [])

  useEffect(() => stopAll, [stopAll])

  function toggle() {
    if (playing) { stopAll(); setPlaying(false); return }
    trackToolUsed(tool.slug)
    setPlaying(true)
    speakFrom(idxRef.current)
  }
  function reset() {
    stopAll(); setPlaying(false); idxRef.current = 0; setCurOrder(null)
    document.querySelector('[data-order]')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Controls */}
        <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-b border-gray-100 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
              {playing ? `⏸ ${t('cs_pause')}` : `▶ ${t('cs_play')}`}
            </button>
            <button onClick={reset} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">↺ {t('cs_reset')}</button>
            <label className="flex items-center gap-1.5 text-sm text-gray-500">
              {t('cs_rate')}
              <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1.5">
                {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showHanja} onChange={(e) => setShowHanja(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_hanja')}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showReading} onChange={(e) => setShowReading(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_reading')}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showTrans} onChange={(e) => setShowTrans(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_translation')}
            </label>
          </div>
        </div>

        {/* Sutra body */}
        <div className="space-y-7">
          {SECTIONS.map((sec) => (
            <section key={sec.no}>
              <h2 className="text-base font-bold text-brand-700 mb-2">
                {sec.no}. {sec.ko}
                {sec.hanja && <span className="ml-2 text-sm font-normal text-gray-400">{sec.hanja}</span>}
              </h2>
              <div className="space-y-3">
                {sec.lines.map((l) => (
                  <div key={l.order} data-order={l.order}
                    className={`scroll-mt-24 rounded-lg px-3 py-2 transition-colors ${curOrder === l.order ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}>
                    {showHanja && l.hanja && <p className="text-gray-400 text-sm leading-relaxed">{l.hanja}</p>}
                    {showReading && <p className="text-gray-900 font-medium leading-relaxed">{l.reading}{l.repeat > 1 && <span className="ml-1.5 text-xs text-brand-400 align-middle">×{l.repeat}</span>}</p>}
                    {showTrans && l.translation && <p className="text-gray-500 text-sm leading-relaxed">{l.translation}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">{t('cs_source')}</p>
      </div>
    </ToolLayout>
  )
}
