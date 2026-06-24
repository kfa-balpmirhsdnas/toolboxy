'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { CHEONSUGYEONG, type SutraLine } from '@/lib/scriptures/cheonsugyeong'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('cheonsugyeong')!
const LINES = CHEONSUGYEONG
const RATES = [0.5, 0.6, 0.7, 0.85, 1, 1.15, 1.3, 1.5]
const FONT_SCALES = [0.8, 1, 1.5, 2, 3]

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

// Best-effort gender hint from known Korean TTS voice names (device-dependent).
function genderHint(v: SpeechSynthesisVoice): string {
  const n = (v.name + ' ' + v.voiceURI).toLowerCase()
  if (/injoon|inhyeok|male|남/.test(n)) return '👨 '
  if (/yuna|heami|sunhi|suni|nari|female|여/.test(n)) return '👩 '
  return ''
}

export default function CheonsugyeongPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [showHanja, setShowHanja] = useState(false)
  const [showReading, setShowReading] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [curOrder, setCurOrder] = useState<number | null>(null)
  const [rate, setRate] = useState(1)
  const [fontScale, setFontScale] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState('')

  const genRef = useRef(0)
  const idxRef = useRef(0)
  const rateRef = useRef(rate); rateRef.current = rate
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const watchdog = useRef<number | null>(null)

  // Load available Korean voices (populates asynchronously on some browsers).
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const load = () => {
      const ko = synth.getVoices().filter((v) => /ko/i.test(v.lang))
      setVoices(ko)
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [])
  useEffect(() => {
    voiceRef.current = voices.find((v) => v.voiceURI === voiceURI) ?? null
  }, [voiceURI, voices])

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
        if (voiceRef.current) u.voice = voiceRef.current
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

  const toggle = useCallback(() => {
    if (playing) { stopAll(); setPlaying(false); return }
    trackToolUsed(tool.slug)
    setPlaying(true)
    speakFrom(idxRef.current)
  }, [playing, stopAll, speakFrom])

  function reset() {
    stopAll(); setPlaying(false); idxRef.current = 0; setCurOrder(null)
    document.querySelector('[data-order]')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Controls — stay pinned below the site header so options stay reachable mid-recitation */}
        <div className="sticky top-14 z-30 -mx-6 px-6 pt-4 pb-3 bg-white/95 backdrop-blur border-b border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
              {playing ? `⏸ ${t('cs_pause')}` : `▶ ${t('cs_play')}`}
            </button>
            <button onClick={reset} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">↺ {t('cs_reset')}</button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <label className="flex items-center gap-1.5 whitespace-nowrap">
              {t('cs_rate')}
              <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1.5">
                {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5 whitespace-nowrap">
              {t('cs_size')}
              <select value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1.5">
                {FONT_SCALES.map((f) => <option key={f} value={f}>{f}×</option>)}
              </select>
            </label>
            {voices.length > 0 && (
              <label className="flex items-center gap-1.5 whitespace-nowrap">
                {t('cs_voice')}
                <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 max-w-[11rem]">
                  <option value="">{t('cs_voice_default')}</option>
                  {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{genderHint(v)}{v.name}</option>)}
                </select>
              </label>
            )}
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

        {/* Sutra body (font scales with the selected multiplier) */}
        <div className="space-y-7" style={{ fontSize: `${fontScale}rem` }}>
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
                    {showHanja && l.hanja && <p className="text-[0.9em] text-gray-400 leading-relaxed">{l.hanja}</p>}
                    {showReading && <p className="text-[1.05em] text-gray-900 font-medium leading-relaxed">{l.reading}{l.repeat > 1 && <span className="ml-1.5 text-[0.7em] text-brand-400 align-middle">×{l.repeat}</span>}</p>}
                    {showTrans && l.translation && <p className="text-[0.9em] text-gray-500 leading-relaxed">{l.translation}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">{t('cs_source')}</p>
      </div>

      {/* Floating play/pause — always reachable, however far you've scrolled */}
      <button onClick={toggle} aria-label={playing ? t('cs_pause') : t('cs_play')}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
        {playing ? '⏸' : '▶'}
      </button>
    </ToolLayout>
  )
}
