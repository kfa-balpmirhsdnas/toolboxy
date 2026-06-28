'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import type { ToolMeta } from '@/lib/tools/registry'
import type { SutraLine } from '@/lib/scriptures/types'
import { trackToolUsed } from '@/lib/gtag'

const RATES = [0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1.15, 1.3, 1.5]
const FONT_SCALES = [0.8, 1, 1.2, 1.5, 2, 3]
const SLEEPS = [0, 5, 10, 30, 60, 120]
const TARGETS = [7, 21, 108, 0] // 0 = 무한(∞)
type Loop = 'off' | 'section' | 'all'
interface Section { no: number; ko: string; en: string; hanja: string; type: string; lines: SutraLine[] }

// Best-effort gender hint from known TTS voice names (device-dependent).
function genderHint(v: SpeechSynthesisVoice): string {
  const n = (v.name + ' ' + v.voiceURI).toLowerCase()
  if (/injoon|inhyeok|male|남/.test(n)) return '👨 '
  if (/yuna|heami|sunhi|suni|nari|female|여/.test(n)) return '👩 '
  return ''
}

/** Reusable scripture reader/reciter — powers 천수경, 반야심경, 신묘장구대다라니, … from one component. */
export default function SutraViewer({ lines, tool, lang, intro, reciteCounter }: { lines: SutraLine[]; tool: ToolMeta; lang: string; intro?: string; reciteCounter?: boolean }) {
  const t = useTranslations('toolui')
  const LINES = lines
  const SECTIONS = useMemo<Section[]>(() => {
    const s: Section[] = []
    for (const l of LINES) {
      const cur = s[s.length - 1]
      if (!cur || cur.no !== l.section) s.push({ no: l.section, ko: l.sectionKo, en: l.sectionEn || '', hanja: l.sectionHanja, type: l.type, lines: [l] })
      else cur.lines.push(l)
    }
    return s
  }, [LINES])
  const isJa = lang === 'ja'
  const isEn = lang === 'en'
  // Hide toggles/TOC that have no content for this scripture (e.g. the dharani has
  // no per-line 한자 and no 해석, and is a single section).
  const hasHanja = useMemo(() => LINES.some((l) => !!l.hanja), [LINES])
  const hasTrans = useMemo(() => LINES.some((l) => !!(isJa && l.translationJa ? l.translationJa : isEn && l.translationEn ? l.translationEn : l.translation)), [LINES, isJa, isEn])
  // When 독음 is the only field (e.g. the dharani), don't let it be toggled off —
  // that would leave the line empty. Hide its checkbox and always render it.
  const readingOnly = !hasHanja && !hasTrans
  const showTocBar = SECTIONS.length > 1

  // Namespaced by locale: each installed app (/ko, /ja) keeps its own favorites,
  // settings and last position — two separate apps, two separate states.
  const PREFS_KEY = `${tool.slug}:${lang}:prefs`
  const FAVS_KEY = `${tool.slug}:${lang}:favs`
  const POS_KEY = `${tool.slug}:${lang}:pos`
  const COUNT_KEY = `${tool.slug}:${lang}:count`
  const savePos = useCallback((i: number) => { try { localStorage.setItem(POS_KEY, String(i)) } catch { /* ignore */ } }, [POS_KEY])
  const saveCount = useCallback((n: number) => { try { localStorage.setItem(COUNT_KEY, String(n)) } catch { /* ignore */ } }, [COUNT_KEY])

  const [showHanja, setShowHanja] = useState(false)
  const [showReading, setShowReading] = useState(true)
  const [showTrans, setShowTrans] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [curOrder, setCurOrder] = useState<number | null>(null)
  const [rate, setRate] = useState(0.5)
  const [fontScale, setFontScale] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState('off')
  const [currentSection, setCurrentSection] = useState(1)
  const [repCountdown, setRepCountdown] = useState<number | null>(null)
  const [karaoke, setKaraoke] = useState(true)
  const [readChars, setReadChars] = useState(0)
  const [loop, setLoop] = useState<Loop>(reciteCounter ? 'all' : 'off')
  const [reciteCount, setReciteCount] = useState(0)
  const [reciteTarget, setReciteTarget] = useState(108)
  const [sleepMin, setSleepMin] = useState(0)
  const [dark, setDark] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [favOnly, setFavOnly] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const genRef = useRef(0)
  const idxRef = useRef(0)
  const playingRef = useRef(playing); playingRef.current = playing
  const rateRef = useRef(rate); rateRef.current = rate
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const voiceOnRef = useRef(false); voiceOnRef.current = voiceURI !== 'off'
  const karaokeRef = useRef(karaoke); karaokeRef.current = karaoke
  const loopRef = useRef<Loop>('off'); loopRef.current = loop
  const reciteCountRef = useRef(0); reciteCountRef.current = reciteCount
  const reciteTargetRef = useRef(108); reciteTargetRef.current = reciteTarget
  const loopSectionRef = useRef(1)
  const watchdog = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const c = (light: string, darkCls: string) => (dark ? darkCls : light)
  const favSet = new Set(favorites)
  const trOf = (l: SutraLine) => (isJa && l.translationJa ? l.translationJa : isEn && l.translationEn ? l.translationEn : l.translation)
  const readingOf = (l: SutraLine) => (isJa && l.readingJa ? l.readingJa : isEn && l.readingEn ? l.readingEn : l.reading)
  const ttsLang = isJa ? 'ja-JP' : isEn ? 'en-US' : 'ko-KR'
  const secName = (s: { ko: string; en: string; hanja: string }) => (isJa && s.hanja ? s.hanja : isEn && s.en ? s.en : s.ko)

  // Persistence: load saved settings + last position on mount.
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
      if (typeof p.rate === 'number') setRate(p.rate)
      if (typeof p.fontScale === 'number') setFontScale(p.fontScale)
      if (typeof p.voiceURI === 'string') setVoiceURI(p.voiceURI)
      if (typeof p.showHanja === 'boolean') setShowHanja(p.showHanja)
      if (typeof p.showReading === 'boolean') setShowReading(p.showReading)
      if (typeof p.showTrans === 'boolean') setShowTrans(p.showTrans)
      if (typeof p.karaoke === 'boolean') setKaraoke(p.karaoke)
      if (typeof p.dark === 'boolean') setDark(p.dark)
      if (p.loop === 'section' || p.loop === 'all' || p.loop === 'off') setLoop(p.loop)
      if (typeof p.reciteTarget === 'number') setReciteTarget(p.reciteTarget)
      const cnt = Number(localStorage.getItem(COUNT_KEY))
      if (cnt > 0) setReciteCount(cnt)
      const favs = JSON.parse(localStorage.getItem(FAVS_KEY) || '[]')
      if (Array.isArray(favs)) setFavorites(favs.filter((n) => typeof n === 'number'))
      const pos = Number(localStorage.getItem(POS_KEY))
      if (pos > 0 && pos < LINES.length) {
        idxRef.current = pos
        setCurOrder(LINES[pos].order); setCurrentSection(LINES[pos].section)
        setTimeout(() => document.querySelector(`[data-order="${LINES[pos].order}"]`)?.scrollIntoView({ block: 'center' }), 120)
      }
    } catch { /* ignore */ }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ rate, fontScale, voiceURI, showHanja, showReading, showTrans, karaoke, dark, loop, reciteTarget })) } catch { /* ignore */ }
  }, [loaded, PREFS_KEY, rate, fontScale, voiceURI, showHanja, showReading, showTrans, karaoke, dark, loop, reciteTarget])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(FAVS_KEY, JSON.stringify(favorites)) } catch { /* ignore */ }
  }, [loaded, FAVS_KEY, favorites])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const re = new RegExp('^' + (isJa ? 'ja' : isEn ? 'en' : 'ko') + '([-_]|$)', 'i')
    const load = () => {
      const matched = synth.getVoices().filter((v) => re.test(v.lang))
      const seen = new Set<string>()
      setVoices(matched.filter((v) => (seen.has(v.name) ? false : (seen.add(v.name), true))))
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    setRepCountdown(null)
  }, [])

  const speakFrom = useCallback((startIdx: number) => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    const myGen = ++genRef.current
    const alive = () => genRef.current === myGen
    synth?.cancel()
    loopSectionRef.current = LINES[startIdx]?.section ?? 1

    const speakLine = (i: number) => {
      if (!alive()) return
      if (i >= LINES.length) {
        if (loopRef.current === 'all') {
          if (reciteCounter) {
            const next = reciteCountRef.current + 1
            reciteCountRef.current = next; setReciteCount(next); saveCount(next)
            if (reciteTargetRef.current > 0 && next >= reciteTargetRef.current) { setPlaying(false); setCurOrder(null); return }
          }
          speakLine(0); return
        }
        setPlaying(false); setCurOrder(null); return
      }
      if (loopRef.current === 'section' && LINES[i].section !== loopSectionRef.current) {
        const start = LINES.findIndex((l) => l.section === loopSectionRef.current)
        if (start >= 0) { speakLine(start); return }
      }
      const line = LINES[i]
      const text = readingOf(line)
      if (!text) { speakLine(i + 1); return }
      idxRef.current = i
      savePos(i)
      setCurOrder(line.order)
      setCurrentSection(line.section)
      scrollToOrder(line.order)
      const reps = Math.max(1, line.repeat)
      let rep = 0
      const once = () => {
        if (!alive()) return
        setRepCountdown(reps > 1 ? reps - rep : null)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        setReadChars(0)
        if (karaokeRef.current) {
          const len = text.length
          const dur = voiceOnRef.current && synth
            ? Math.max(900, (len * 150) / rateRef.current)
            : Math.max(1100, (len * 170) / rateRef.current)
          const startT = performance.now()
          let last = -1
          const animate = () => {
            if (!alive() || !karaokeRef.current) return
            const p = Math.min(1, (performance.now() - startT) / dur)
            const rc = Math.round(p * len)
            if (rc !== last) { last = rc; setReadChars(rc) }
            if (p < 1) rafRef.current = requestAnimationFrame(animate)
          }
          rafRef.current = requestAnimationFrame(animate)
        }
        let done = false
        const proceed = () => {
          if (done || !alive()) return
          done = true
          if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
          rep++
          if (rep < reps) once()
          else speakLine(i + 1)
        }
        if (!voiceOnRef.current || !synth) {
          watchdog.current = window.setTimeout(proceed, Math.max(1100, (text.length * 170) / rateRef.current))
          return
        }
        const u = new SpeechSynthesisUtterance(text)
        u.lang = ttsLang; u.rate = rateRef.current
        if (voiceRef.current) u.voice = voiceRef.current
        u.onend = proceed; u.onerror = proceed
        synth.speak(u)
        watchdog.current = window.setTimeout(proceed, Math.min(15000, text.length * 220 + 2500))
      }
      once()
    }
    speakLine(startIdx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => stopAll, [stopAll])
  useEffect(() => {
    if (!playing || sleepMin === 0) return
    const id = window.setTimeout(() => { stopAll(); setPlaying(false) }, sleepMin * 60000)
    return () => window.clearTimeout(id)
  }, [playing, sleepMin, stopAll])
  useEffect(() => {
    const onUserScroll = () => { if (playingRef.current) { stopAll(); setPlaying(false) } }
    window.addEventListener('wheel', onUserScroll, { passive: true })
    window.addEventListener('touchmove', onUserScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onUserScroll)
      window.removeEventListener('touchmove', onUserScroll)
    }
  }, [stopAll])
  useEffect(() => {
    const onScroll = () => {
      if (playingRef.current) return
      const bar = document.querySelector('.sticky.top-14')
      const threshold = 56 + (bar?.getBoundingClientRect().height ?? 60) + 16
      const headers = document.querySelectorAll<HTMLElement>('[data-section]')
      let cur = 1
      for (const el of headers) {
        if (el.getBoundingClientRect().top <= threshold) cur = Number(el.dataset.section)
        else break
      }
      setCurrentSection(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = useCallback(() => {
    if (playing) { stopAll(); setPlaying(false); return }
    if (favOnly) setFavOnly(false)
    trackToolUsed(tool.slug)
    setPlaying(true)
    speakFrom(idxRef.current)
  }, [playing, favOnly, stopAll, speakFrom, tool.slug])

  function goToIndex(i: number, autoplay: boolean) {
    i = Math.min(LINES.length - 1, Math.max(0, i))
    idxRef.current = i
    savePos(i)
    const order = LINES[i].order
    if (autoplay || playingRef.current) {
      if (!playingRef.current) { trackToolUsed(tool.slug); setPlaying(true) }
      speakFrom(i)
    } else {
      setCurOrder(order); setCurrentSection(LINES[i].section); setReadChars(0); scrollToOrder(order)
    }
  }
  const jumpTo = (order: number) => goToIndex(LINES.findIndex((l) => l.order === order), true)
  const step = (delta: number) => goToIndex(idxRef.current + delta, false)
  function jumpToSection(no: number) {
    const i = LINES.findIndex((l) => l.section === no)
    if (i < 0) return
    setCurrentSection(no)
    goToIndex(i, true)
  }
  function toggleFav(order: number) {
    setFavorites((f) => (f.includes(order) ? f.filter((x) => x !== order) : [...f, order]))
  }
  function toggleFavOnly() {
    stopAll(); setPlaying(false)
    setFavOnly((v) => !v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selCls = `rounded-lg border px-1 py-1.5 w-[3.6rem] ${c('border-gray-200', 'bg-gray-800 text-gray-100 border-gray-600')}`
  const wideSelCls = `rounded-lg border px-1.5 py-1.5 ${c('border-gray-200', 'bg-gray-800 text-gray-100 border-gray-600')}`

  const visibleSections = favOnly
    ? SECTIONS.map((s) => ({ ...s, lines: s.lines.filter((l) => favSet.has(l.order)) })).filter((s) => s.lines.length > 0)
    : SECTIONS

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className={`space-y-5 ${dark ? '-m-6 p-6 rounded-2xl bg-gray-900 text-gray-100' : ''}`}>
        <div className={`sticky top-14 z-30 -mx-6 px-6 pt-4 pb-3 backdrop-blur border-b space-y-3 ${c('bg-white/95 border-gray-200', 'bg-gray-900/95 border-gray-700')}`}>
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
              {playing ? `⏸ ${t('cs_pause')}` : `▶ ${t('cs_play')}`}
            </button>
            <button onClick={() => setDark((v) => !v)} aria-pressed={dark}
              className={`px-3 py-2.5 text-sm rounded-xl border transition-colors whitespace-nowrap ${dark ? 'bg-gray-700 text-white border-gray-600' : c('border-gray-300 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-200 hover:bg-gray-800')}`}>
              🌙 {t('cs_dark')}
            </button>
            <button onClick={toggleFavOnly} aria-pressed={favOnly}
              className={`px-3 py-2.5 text-sm rounded-xl border transition-colors whitespace-nowrap ${favOnly ? 'bg-amber-100 text-amber-700 border-amber-300' : c('border-gray-300 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-200 hover:bg-gray-800')}`}>
              ★ {t('cs_favonly')}
            </button>
          </div>
          {showTocBar && (
            <label className={`flex items-center gap-2 text-sm ${c('text-gray-500', 'text-gray-300')}`}>
              <span className="whitespace-nowrap">{t('cs_toc')}</span>
              <select value={currentSection} onChange={(e) => jumpToSection(Number(e.target.value))} className={`flex-1 min-w-0 ${wideSelCls}`}>
                {SECTIONS.map((s) => <option key={s.no} value={s.no}>{s.no}. {secName(s)}</option>)}
              </select>
            </label>
          )}
          {reciteCounter && (
            <div className={`flex items-center gap-3 text-sm ${c('text-gray-600', 'text-gray-200')}`}>
              <span className="whitespace-nowrap font-medium">{t('dd_count')}</span>
              <span className={`font-bold text-xl tabular-nums ${c('text-brand-700', 'text-brand-300')}`}>{reciteCount}</span>
              <span className="whitespace-nowrap">/ {reciteTarget === 0 ? '∞' : reciteTarget}</span>
              <select aria-label={t('dd_target')} value={reciteTarget}
                onChange={(e) => setReciteTarget(Number(e.target.value))} className={`${wideSelCls} w-16`}>
                {TARGETS.map((n) => <option key={n} value={n}>{n === 0 ? '∞' : n}</option>)}
              </select>
              <button onClick={() => setReciteCount((n) => { const v = n + 1; saveCount(v); return v })}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap ${c('border-gray-300 text-gray-700 hover:bg-gray-50', 'border-gray-600 text-gray-200 hover:bg-gray-800')}`}>+1</button>
              <button onClick={() => { setReciteCount(0); saveCount(0) }} aria-label={t('dd_reset')}
                className={`ml-auto px-2.5 py-1 rounded-lg border whitespace-nowrap ${c('border-gray-300 text-gray-500 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-800')}`}>↺</button>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-sm ${c('text-gray-500', 'text-gray-300')}`}>
              <label className="flex items-center gap-2 whitespace-nowrap">{t('cs_rate')}
                <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className={selCls}>
                  {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 whitespace-nowrap">{t('cs_size')}
                <select value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className={selCls}>
                  {FONT_SCALES.map((f) => <option key={f} value={f}>{f}×</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 whitespace-nowrap">{t('cs_voice')}
                <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)} className={selCls}>
                  <option value="off">{t('cs_voice_off')}</option>
                  {voices.length === 0 && <option value="">{t('cs_voice_default')}</option>}
                  {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{genderHint(v)}{v.name}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 whitespace-nowrap">{t('cs_loop')}
                <select value={loop} onChange={(e) => setLoop(e.target.value as Loop)} className={`${wideSelCls} w-16`}>
                  <option value="off">{t('cs_loop_off')}</option>
                  <option value="section">{t('cs_loop_section')}</option>
                  <option value="all">{t('cs_loop_all')}</option>
                </select>
              </label>
              <label className="flex items-center gap-2 whitespace-nowrap">{t('cs_timer')}
                <select value={sleepMin} onChange={(e) => setSleepMin(Number(e.target.value))} className={`${wideSelCls} w-16`}>
                  {SLEEPS.map((m) => <option key={m} value={m}>{m === 0 ? t('cs_loop_off') : `${m}${t('cs_min')}`}</option>)}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              {hasHanja && <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={showHanja} onChange={(e) => setShowHanja(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_hanja')}</label>}
              {!readingOnly && <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={showReading} onChange={(e) => setShowReading(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_reading')}</label>}
              {hasTrans && <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={showTrans} onChange={(e) => setShowTrans(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_translation')}</label>}
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={karaoke} onChange={(e) => setKaraoke(e.target.checked)} className="w-4 h-4 accent-brand-600" />{t('cs_karaoke')}</label>
            </div>
          </div>
        </div>

        {intro && (
          <p className={`text-sm leading-relaxed rounded-xl px-4 py-3 ${c('bg-brand-50 text-brand-800', 'bg-gray-800 text-brand-200')}`}>{intro}</p>
        )}

        {favOnly && visibleSections.length === 0 ? (
          <p className={`text-center py-10 text-sm ${c('text-gray-400', 'text-gray-500')}`}>{t('cs_fav_empty')}</p>
        ) : (
          <div className="space-y-7" style={{ fontSize: `${fontScale}rem` }}>
            {visibleSections.map((sec) => (
              <section key={sec.no} data-section={sec.no} className="scroll-mt-40">
                <h2 className={`text-base font-bold mb-2 ${c('text-brand-700', 'text-brand-300')}`}>
                  {sec.no}. {secName(sec)}
                  {!isJa && !isEn && sec.hanja && <span className={`ml-2 text-sm font-normal ${c('text-gray-400', 'text-gray-500')}`}>{sec.hanja}</span>}
                </h2>
                <div className="space-y-3">
                  {sec.lines.map((l) => {
                    const fav = favSet.has(l.order)
                    return (
                      <div key={l.order} data-order={l.order} onClick={() => jumpTo(l.order)}
                        className={`relative scroll-mt-24 rounded-lg pl-3 pr-[1.9em] py-[0.45em] cursor-pointer transition-colors ${curOrder === l.order ? c('bg-brand-50 ring-1 ring-brand-200', 'bg-gray-800 ring-1 ring-brand-700') : c('hover:bg-gray-50', 'hover:bg-gray-800')}`}>
                        <button onClick={(e) => { e.stopPropagation(); toggleFav(l.order) }} aria-label={t('cs_fav')}
                          className={`absolute top-[0.5em] right-[0.3em] text-[1.35em] leading-none ${fav ? 'text-amber-400' : c('text-gray-300 hover:text-amber-400', 'text-gray-600 hover:text-amber-400')}`}>{fav ? '★' : '☆'}</button>
                        {showHanja && l.hanja && <p className={`text-[0.9em] leading-relaxed ${c('text-gray-400', 'text-gray-500')}`}>{l.hanja}</p>}
                        {(showReading || readingOnly) && <p className={`text-[1.05em] font-medium leading-relaxed ${c('text-gray-900', 'text-gray-100')}`}>{
                          karaoke && curOrder === l.order
                            ? <>{<span className="text-rose-500 font-semibold">{readingOf(l).slice(0, readChars)}</span>}{readingOf(l).slice(readChars)}</>
                            : readingOf(l)
                        }{l.repeat > 1 && (
                          curOrder === l.order && repCountdown != null
                            ? <span className="ml-2 inline-flex items-center justify-center w-[1.4em] h-[1.4em] rounded-full bg-brand-600 text-white text-[0.7em] font-bold align-middle">{repCountdown}</span>
                            : <span className="ml-1.5 text-[0.7em] text-brand-400 align-middle">×{l.repeat}</span>
                        )}</p>}
                        {showTrans && trOf(l) && <p className={`text-[0.9em] leading-relaxed ${c('text-gray-500', 'text-gray-400')}`}>{trOf(l)}</p>}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`w-full py-3.5 text-base font-semibold rounded-xl border transition-colors ${c('border-gray-300 text-gray-700 hover:bg-gray-50', 'border-gray-600 text-gray-200 hover:bg-gray-800')}`}>
          ↑ {t('cs_top')}
        </button>
        <p className={`text-xs leading-relaxed border-t pt-4 ${c('text-gray-400 border-gray-100', 'text-gray-500 border-gray-700')}`}>{t('cs_source')}</p>
      </div>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
        <button onClick={() => step(-1)} aria-label={t('cs_prev')}
          className={`w-11 h-11 rounded-full shadow-lg border text-lg flex items-center justify-center ${c('bg-white border-gray-200 text-gray-600 hover:bg-gray-50', 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700')}`}>▲</button>
        <button onClick={toggle} aria-label={playing ? t('cs_pause') : t('cs_play')}
          className={`w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center transition-colors ${playing ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => step(1)} aria-label={t('cs_next')}
          className={`w-11 h-11 rounded-full shadow-lg border text-lg flex items-center justify-center ${c('bg-white border-gray-200 text-gray-600 hover:bg-gray-50', 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700')}`}>▼</button>
      </div>
    </ToolLayout>
  )
}
