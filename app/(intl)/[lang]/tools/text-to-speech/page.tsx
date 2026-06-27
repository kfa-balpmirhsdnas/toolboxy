'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('text-to-speech')!

export default function TextToSpeechPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang

  const [text, setText] = useState(() => t('tts_sample'))
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [spoken, setSpoken] = useState<[number, number] | null>(null) // [start,end] char range

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  // Load device voices (all languages), default to one matching the page locale.
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const load = () => {
      const all = synth.getVoices()
      const seen = new Set<string>()
      const uniq = all.filter((v) => (seen.has(v.voiceURI) ? false : (seen.add(v.voiceURI), true)))
      setVoices(uniq)
      setVoiceURI((cur) => {
        if (cur && uniq.some((v) => v.voiceURI === cur)) return cur
        const re = new RegExp('^' + lang + '([-_]|$)', 'i')
        return (uniq.find((v) => re.test(v.lang)) ?? uniq[0])?.voiceURI ?? ''
      })
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [lang])
  useEffect(() => { voiceRef.current = voices.find((v) => v.voiceURI === voiceURI) ?? null }, [voiceURI, voices])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setPlaying(false); setPaused(false); setSpoken(null)
  }, [])
  useEffect(() => stop, [stop]) // cancel on unmount

  const speak = () => {
    const synth = window.speechSynthesis
    if (!synth || !text.trim()) return
    synth.cancel()
    trackToolUsed(tool.slug)
    const u = new SpeechSynthesisUtterance(text)
    if (voiceRef.current) { u.voice = voiceRef.current; u.lang = voiceRef.current.lang }
    u.rate = rate; u.pitch = pitch; u.volume = volume
    u.onboundary = (e) => {
      if (e.name === 'word' || e.charLength) {
        const start = e.charIndex
        const len = e.charLength || (text.slice(start).match(/^\S+/)?.[0].length ?? 0)
        setSpoken([start, start + len])
      }
    }
    u.onend = () => { setPlaying(false); setPaused(false); setSpoken(null) }
    u.onerror = () => { setPlaying(false); setPaused(false); setSpoken(null) }
    synth.speak(u)
    setPlaying(true); setPaused(false)
  }
  const togglePause = () => {
    const synth = window.speechSynthesis
    if (!synth) return
    if (paused) { synth.resume(); setPaused(false) } else { synth.pause(); setPaused(true) }
  }

  const noVoices = voices.length === 0
  const sliderRow = (label: string, val: number, set: (n: number) => void, min: number, max: number, step: number) => (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-gray-600">{label}</span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => set(Number(e.target.value))} className="flex-1 accent-brand-600" />
      <span className="w-10 text-right tabular-nums text-gray-500">{val.toFixed(step < 0.1 ? 2 : 1)}</span>
    </label>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tts_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tts_subtitle')}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('tts_text')}</label>
            <textarea value={text} onChange={(e) => { setText(e.target.value); if (playing) stop() }} rows={6}
              placeholder={t('tts_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
          </div>

          {/* spoken-word highlight preview (shown while playing) */}
          {playing && spoken && (
            <p className="text-sm leading-relaxed bg-brand-50 rounded-lg px-3 py-2 text-gray-700">
              {text.slice(0, spoken[0])}
              <span className="bg-brand-200 text-brand-900 rounded px-0.5">{text.slice(spoken[0], spoken[1])}</span>
              {text.slice(spoken[1])}
            </p>
          )}

          <label className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-gray-600">{t('cs_voice')}</span>
            <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}
              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
              {noVoices && <option value="">{t('tts_no_voice')}</option>}
              {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
            </select>
          </label>

          {sliderRow(t('cs_rate'), rate, setRate, 0.5, 2, 0.1)}
          {sliderRow(t('tts_pitch'), pitch, setPitch, 0, 2, 0.1)}
          {sliderRow(t('tts_volume'), volume, setVolume, 0, 1, 0.05)}

          <div className="flex gap-2 pt-1">
            {!playing ? (
              <button onClick={speak} disabled={!text.trim() || noVoices}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 transition-colors">
                ▶ {t('tts_play')}
              </button>
            ) : (
              <button onClick={togglePause}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors">
                {paused ? `▶ ${t('tts_resume')}` : `⏸ ${t('tts_pause')}`}
              </button>
            )}
            <button onClick={stop} disabled={!playing}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              ⏹ {t('tts_stop')}
            </button>
          </div>

          {noVoices && <p className="text-xs text-amber-600">{t('tts_no_voice_hint')}</p>}
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">{t('tts_note')}</p>
      </div>
    </ToolLayout>
  )
}
