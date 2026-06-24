'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { ELEMENTARY_JA, type JaWord } from '@/lib/elementary-ja'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('elementary-japanese-words')!
const INTERVALS = [2, 3, 5, 7, 10, 15, 20]
const GAPS = [0, 1, 2, 3]
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
  const [intervalSec, setIntervalSec] = useState(10)
  const [gapSec, setGapSec] = useState(1)
  const [repeat, setRepeat] = useState(1)
  const [jaVoice, setJaVoice] = useState(true)
  const [koVoice, setKoVoice] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  const jaRef = useRef(jaVoice); jaRef.current = jaVoice
  const koRef = useRef(koVoice); koRef.current = koVoice
  const gapRef = useRef(gapSec); gapRef.current = gapSec
  const repeatRef = useRef(repeat); repeatRef.current = repeat
  const idxRef = useRef(0); useEffect(() => { idxRef.current = idx }, [idx])
  const gapTimer = useRef<number | null>(null)

  const word: JaWord = ELEMENTARY_JA[order[idx]]

  // Speak Japanese then Korean (each repeated), with a configurable pause between.
  const speak = useCallback((w: JaWord) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const synth = window.speechSynthesis
    if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null }
    synth.cancel()
    const one: { text: string; lang: string; rate: number }[] = []
    if (jaRef.current) one.push({ text: w.ja, lang: 'ja-JP', rate: 0.9 })
    if (koRef.current) one.push({ text: w.ko.replace(/\(.*?\)/g, '').replace(/\/.*/, '').trim(), lang: 'ko-KR', rate: 1 })
    if (one.length === 0) return
    const parts: typeof one = []
    for (let r = 0; r < Math.max(1, repeatRef.current); r++) parts.push(...one)
    const gapMs = gapRef.current * 1000
    let i = 0
    const next = () => {
      if (i >= parts.length) return
      const p = parts[i++]
      const u = new SpeechSynthesisUtterance(p.text)
      u.lang = p.lang; u.rate = p.rate
      u.onend = () => { if (i < parts.length) { if (gapMs > 0) gapTimer.current = window.setTimeout(next, gapMs); else next() } }
      synth.speak(u)
    }
    next()
  }, [])

  const stopAudio = useCallback(() => {
    if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [])

  // Auto-advance + speak each new word while running.
  useEffect(() => {
    if (!running) return
    speak(ELEMENTARY_JA[order[idxRef.current]])
    const id = window.setInterval(() => {
      const ni = idxRef.current + 1 >= order.length ? 0 : idxRef.current + 1
      idxRef.current = ni
      setIdx(ni)
      speak(ELEMENTARY_JA[order[ni]])
    }, intervalSec * 1000)
    return () => window.clearInterval(id)
  }, [running, intervalSec, order, speak])

  // Study-time clock (runs only while playing).
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => stopAudio, [stopAudio])

  function toggle() {
    if (!running) { trackToolUsed(tool.slug); setStarted(true); setRunning(true) }
    else { setRunning(false); stopAudio() }
  }
  function go(delta: number) {
    const ni = (idxRef.current + delta + order.length) % order.length
    idxRef.current = ni; setIdx(ni); setStarted(true); speak(ELEMENTARY_JA[order[ni]])
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Flashcard — fixed height so it never resizes between words */}
        <div className="rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-white px-6 h-72 flex flex-col items-center justify-center text-center overflow-hidden">
          {started ? (
            <>
              <p className="h-7 text-lg text-gray-400 mb-1">{word.yomi !== word.ja ? word.yomi : ''}</p>
              <p className="text-5xl font-bold text-gray-900 leading-tight">{word.ja}</p>
              <p className="text-2xl text-brand-700 mt-4">{word.ko}</p>
              <button onClick={() => speak(word)} aria-label="Listen"
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
