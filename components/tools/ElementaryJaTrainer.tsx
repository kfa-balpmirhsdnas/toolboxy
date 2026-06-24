'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { ELEMENTARY_JA, type JaWord } from '@/lib/elementary-ja'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('elementary-japanese-words')!
const INTERVALS = [3, 5, 7, 10, 15, 20]

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
  const [order, setOrder] = useState<number[]>(() => shuffle(ELEMENTARY_JA.length))
  const [idx, setIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [intervalSec, setIntervalSec] = useState(10)
  const [jaVoice, setJaVoice] = useState(true)
  const [koVoice, setKoVoice] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  const jaRef = useRef(jaVoice); jaRef.current = jaVoice
  const koRef = useRef(koVoice); koRef.current = koVoice
  const idxRef = useRef(0); useEffect(() => { idxRef.current = idx }, [idx])

  const word: JaWord = ELEMENTARY_JA[order[idx]]

  const speak = useCallback((w: JaWord) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (jaRef.current) {
      const u = new SpeechSynthesisUtterance(w.ja)
      u.lang = 'ja-JP'; u.rate = 0.9; window.speechSynthesis.speak(u)
    }
    if (koRef.current) {
      const u = new SpeechSynthesisUtterance(w.ko.replace(/\(.*?\)/g, '').replace(/\/.*/, '').trim())
      u.lang = 'ko-KR'; u.rate = 1; window.speechSynthesis.speak(u)
    }
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

  function toggle() {
    if (!running) { trackToolUsed(tool.slug); setStarted(true); setRunning(true) }
    else { setRunning(false); window.speechSynthesis?.cancel() }
  }
  function go(delta: number) {
    const ni = (idxRef.current + delta + order.length) % order.length
    idxRef.current = ni; setIdx(ni); setStarted(true); speak(ELEMENTARY_JA[order[ni]])
  }
  function restart() {
    setRunning(false); window.speechSynthesis?.cancel()
    setOrder(shuffle(ELEMENTARY_JA.length)); setIdx(0); idxRef.current = 0; setElapsed(0); setStarted(false)
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Flashcard */}
        <div className="rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-white px-6 py-10 text-center min-h-[15rem] flex flex-col items-center justify-center">
          {started ? (
            <>
              {word.yomi !== word.ja && <p className="text-lg text-gray-400 mb-1">{word.yomi}</p>}
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

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => go(-1)} className="w-11 h-11 rounded-full border border-gray-200 text-xl hover:bg-gray-50">‹</button>
          <button onClick={toggle} className="btn-primary px-8 py-3 text-base min-w-[7rem]">{running ? `⏸ ${t('ej_pause')}` : `▶ ${t('ej_start')}`}</button>
          <button onClick={() => go(1)} className="w-11 h-11 rounded-full border border-gray-200 text-xl hover:bg-gray-50">›</button>
        </div>

        {/* Settings */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm pt-1 border-t border-gray-100">
          <label className="flex items-center gap-1.5">
            {t('ej_interval')}
            <select value={intervalSec} onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-2 py-1">
              {INTERVALS.map((s) => <option key={s} value={s}>{s}{t('ej_sec')}</option>)}
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
          <button onClick={restart} className="text-gray-500 hover:text-brand-600">↺ {t('ej_restart')}</button>
        </div>

        <p className="text-xs text-gray-400 text-center">{t('ej_note')}</p>
      </div>
    </ToolLayout>
  )
}
