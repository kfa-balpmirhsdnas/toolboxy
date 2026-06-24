'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { ELEMENTARY_JA, type JaWord } from '@/lib/elementary-ja'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('elementary-japanese-words')!
const INTERVALS = [1, 2, 3, 5, 7, 10, 15]
const GAPS = [0, 1, 2, 3, 4, 5]
const REPEATS = [1, 3, 5]

function shuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ElementaryJaTrainer({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [order] = useState<number[]>(() => shuffle(ELEMENTARY_JA.length))
  const [idx, setIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [intervalSec, setIntervalSec] = useState(3) // gap BETWEEN words (after KO -> next JA)
  const [gapSec, setGapSec] = useState(3) // gap between JA and KO of the same word
  const [repeat, setRepeat] = useState(1)
  const [jaVoice, setJaVoice] = useState(true)
  const [koVoice, setKoVoice] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  const runningRef = useRef(running); runningRef.current = running
  const jaRef = useRef(jaVoice); jaRef.current = jaVoice
  const koRef = useRef(koVoice); koRef.current = koVoice
  const intervalRef = useRef(intervalSec); intervalRef.current = intervalSec
  const gapRef = useRef(gapSec); gapRef.current = gapSec
  const repeatRef = useRef(repeat); repeatRef.current = repeat
  const idxRef = useRef(0); useEffect(() => { idxRef.current = idx }, [idx])
  const timer = useRef<number | null>(null)
  const watchdog = useRef<number | null>(null)
  const genRef = useRef(0)
  const playRef = useRef<(auto: boolean) => void>(() => {})
  const cardRef = useRef<HTMLDivElement>(null)

  const word: JaWord = ELEMENTARY_JA[order[idx]]

  const stopAll = useCallback(() => {
    genRef.current++
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [])

  // Audio-driven playback: JA --(voice gap)-- KO ... (repeat), then --(interval)--
  // next word. Driven by each utterance's onend; a generation token invalidates
  // stale callbacks (skip/pause), and a watchdog advances if onend never fires
  // (e.g. the device has no TTS voice for that language).
  const play = useCallback((auto: boolean) => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    const myGen = ++genRef.current
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
    synth?.cancel()
    const alive = () => genRef.current === myGen && (!auto || runningRef.current)

    const w = ELEMENTARY_JA[order[idxRef.current]]
    const koText = w.ko.replace(/\(.*?\)/g, '').replace(/\/.*/, '').trim()
    const one: { text: string; lang: string; rate: number }[] = []
    if (jaRef.current) one.push({ text: w.ja, lang: 'ja-JP', rate: 0.9 })
    if (koRef.current) one.push({ text: koText, lang: 'ko-KR', rate: 1 })
    const parts: typeof one = []
    for (let r = 0; r < Math.max(1, repeatRef.current); r++) parts.push(...one)

    const advance = () => {
      timer.current = window.setTimeout(() => {
        if (!alive()) return
        const ni = idxRef.current + 1 >= order.length ? 0 : idxRef.current + 1
        idxRef.current = ni; setIdx(ni)
        playRef.current(true)
      }, intervalRef.current * 1000)
    }

    if (parts.length === 0 || !synth) { if (auto) advance(); return }
    const seq = (k: number) => {
      if (!alive()) return
      const p = parts[k]
      const u = new SpeechSynthesisUtterance(p.text)
      u.lang = p.lang; u.rate = p.rate
      let done = false
      const proceed = () => {
        if (done || !alive()) return
        done = true
        if (watchdog.current) { clearTimeout(watchdog.current); watchdog.current = null }
        if (k + 1 < parts.length) timer.current = window.setTimeout(() => seq(k + 1), gapRef.current * 1000)
        else if (auto) advance()
      }
      u.onend = proceed; u.onerror = proceed
      synth.speak(u)
      watchdog.current = window.setTimeout(proceed, Math.min(12000, p.text.length * 350 + 4000))
    }
    seq(0)
  }, [order])
  playRef.current = play

  // Start / stop the loop when `running` flips.
  useEffect(() => {
    if (!running) return
    play(true)
    return () => stopAll()
  }, [running, play, stopAll])

  // Study-time clock.
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => stopAll, [stopAll])

  function toggle() {
    if (!running) {
      trackToolUsed(tool.slug); setStarted(true); setRunning(true)
      // Scroll so the card is at the top (above the keyboard / below the header).
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    } else { setRunning(false) }
  }
  function go(delta: number) {
    const ni = (idxRef.current + delta + order.length) % order.length
    idxRef.current = ni; setIdx(ni); setStarted(true)
    if (runningRef.current) play(true)
    else play(false)
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Flashcard — fixed height so it never resizes between words */}
        <div ref={cardRef} className="scroll-mt-20 rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-white px-6 h-72 flex flex-col items-center justify-center text-center overflow-hidden">
          {started ? (
            <>
              <p className="h-7 text-lg text-gray-400 mb-1">{word.yomi !== word.ja ? word.yomi : ''}</p>
              <p className="text-5xl font-bold text-gray-900 leading-tight">{word.ja}</p>
              <p className="text-2xl text-brand-700 mt-4">{word.ko}</p>
              <button onClick={() => play(false)} aria-label="Listen"
                className="mt-5 text-sm bg-white border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50">🔊</button>
            </>
          ) : (
            <p className="text-gray-400">{t('ej_hint')}</p>
          )}
        </div>

        {/* Progress + study time */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{idx + 1} / {ELEMENTARY_JA.length}</span>
          <span className="font-mono">⏱ {t('ej_time')} {mmss}</span>
        </div>

        {/* Playback controls — fixed button width so it doesn't jump on play/pause */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => go(-1)} className="w-11 h-11 rounded-full border border-gray-200 text-xl hover:bg-gray-50">‹</button>
          <button onClick={toggle} className="btn-primary w-40 py-3 text-base text-center">{running ? `⏸ ${t('ej_pause')}` : `▶ ${t('ej_start')}`}</button>
          <button onClick={() => go(1)} className="w-11 h-11 rounded-full border border-gray-200 text-xl hover:bg-gray-50">›</button>
        </div>

        {/* Settings */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm pt-3 border-t border-gray-100">
          <label className="flex items-center gap-1.5">
            {t('ej_interval')}
            <select value={intervalSec} onChange={(e) => setIntervalSec(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1">
              {INTERVALS.map((s) => <option key={s} value={s}>{s}{t('ej_sec')}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            {t('ej_voicegap')}
            <select value={gapSec} onChange={(e) => setGapSec(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1">
              {GAPS.map((s) => <option key={s} value={s}>{s}{t('ej_sec')}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            {t('ej_repeat')}
            <select value={repeat} onChange={(e) => setRepeat(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1">
              {REPEATS.map((s) => <option key={s} value={s}>{s}{t('ej_times')}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={jaVoice} onChange={(e) => setJaVoice(e.target.checked)} className="w-4 h-4 accent-brand-600" />
            🇯🇵 {t('ej_ja_voice')}
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={koVoice} onChange={(e) => setKoVoice(e.target.checked)} className="w-4 h-4 accent-brand-600" />
            🇰🇷 {t('ej_ko_voice')}
          </label>
        </div>

        <p className="text-xs text-gray-400 text-center">{t('ej_note')}</p>
      </div>
    </ToolLayout>
  )
}
