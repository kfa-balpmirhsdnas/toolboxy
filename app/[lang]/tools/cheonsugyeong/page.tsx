'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { CHEONSUGYEONG, type SutraLine } from '@/lib/scriptures/cheonsugyeong'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('cheonsugyeong')!
const LINES = CHEONSUGYEONG
const RATES = [0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1.15, 1.3, 1.5]
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
  const [voiceURI, setVoiceURI] = useState('off') // 'off' = silent follow-along (default)

  const genRef = useRef(0)
  const idxRef = useRef(0)
  const playingRef = useRef(playing); playingRef.current = playing
  const rateRef = useRef(rate); rateRef.current = rate
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const voiceOnRef = useRef(false); voiceOnRef.current = voiceURI !== 'off'
  const watchdog = useRef<number | null>(null)

  // Load available Korean voices (populates asynchronously on some browsers).
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const load = () => {
      // Match Korean only — `^ko` plus a separator/end so we don't catch e.g.
      // Konkani (`kok-IN`), which `/ko/` did. Drop the device-default voice
      // (already represented by the '기본' option) and de-dupe by name, so we
      // don't list e.g. "한국어 (대한민국)" right next to "기본".
      const ko = synth.getVoices().filter((v) => /^ko([-_]|$)/i.test(v.lang))
      const seen = new Set<string>()
      setVoices(ko.filter((v) => (v.default || seen.has(v.name)) ? false : (seen.add(v.name), true)))
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
        let done = false
        const proceed = () => {
          if (done || !alive()) return
          done = true
          if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
          rep++
          if (rep < reps) once()
          else speakLine(i + 1)
        }
        // Voice off → silent follow-along, paced by estimated reading time.
        if (!voiceOnRef.current || !synth) {
          watchdog.current = window.setTimeout(proceed, Math.max(1100, (line.reading.length * 170) / rateRef.current))
          return
        }
        const u = new SpeechSynthesisUtterance(line.reading)
        u.lang = 'ko-KR'; u.rate = rateRef.current
        if (voiceRef.current) u.voice = voiceRef.current
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

  // Manual scroll (wheel / touch drag) pauses recitation so the auto-scroll stops
  // fighting the user. These events fire only on real input — programmatic
  // scrollIntoView does not trigger them, so there are no false pauses.
  useEffect(() => {
    const onUserScroll = () => {
      if (playingRef.current) { stopAll(); setPlaying(false) }
    }
    window.addEventListener('wheel', onUserScroll, { passive: true })
    window.addEventListener('touchmove', onUserScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onUserScroll)
      window.removeEventListener('touchmove', onUserScroll)
    }
  }, [stopAll])

  const toggle = useCallback(() => {
    if (playing) { stopAll(); setPlaying(false); return }
    trackToolUsed(tool.slug)
    setPlaying(true)
    speakFrom(idxRef.current)
  }, [playing, stopAll, speakFrom])

  function reset() {
    stopAll(); setPlaying(false); idxRef.current = 0; setCurOrder(null)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // all the way to the page top, above the sticky bar
  }
  // Tap any line to jump there — if reciting, continue from that line.
  function jumpTo(order: number) {
    const i = LINES.findIndex((l) => l.order === order)
    if (i < 0) return
    idxRef.current = i
    if (playing) speakFrom(i)
    else { setCurOrder(order); scrollToOrder(order) }
  }
  // Move one line at a time (floating ▲/▼).
  function step(delta: number) {
    const ni = Math.min(LINES.length - 1, Math.max(0, idxRef.current + delta))
    jumpTo(LINES[ni].order)
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
          <div className="flex items-center justify-between sm:justify-start sm:gap-4 text-sm text-gray-500">
            <label className="flex items-center gap-1 whitespace-nowrap">
              {t('cs_rate')}
              <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="rounded-lg border border-gray-200 px-1 py-1.5 w-[3.6rem]">
                {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1 whitespace-nowrap">
              {t('cs_size')}
              <select value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="rounded-lg border border-gray-200 px-1 py-1.5 w-[3.6rem]">
                {FONT_SCALES.map((f) => <option key={f} value={f}>{f}×</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1 whitespace-nowrap">
              {t('cs_voice')}
              <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)} className="rounded-lg border border-gray-200 px-1 py-1.5 w-[3.6rem]">
                <option value="off">{t('cs_voice_off')}</option>
                <option value="">{t('cs_voice_default')}</option>
                {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{genderHint(v)}{v.name}</option>)}
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
                  <div key={l.order} data-order={l.order} onClick={() => jumpTo(l.order)}
                    className={`scroll-mt-24 rounded-lg px-3 py-2 cursor-pointer transition-colors ${curOrder === l.order ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-gray-50'}`}>
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

      {/* Floating controls — always reachable: prev line / play-pause / next line */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
        <button onClick={() => step(-1)} aria-label={t('cs_prev')}
          className="w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 text-lg flex items-center justify-center hover:bg-gray-50">▲</button>
        <button onClick={toggle} aria-label={playing ? t('cs_pause') : t('cs_play')}
          className={`w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => step(1)} aria-label={t('cs_next')}
          className="w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 text-lg flex items-center justify-center hover:bg-gray-50">▼</button>
      </div>
    </ToolLayout>
  )
}
