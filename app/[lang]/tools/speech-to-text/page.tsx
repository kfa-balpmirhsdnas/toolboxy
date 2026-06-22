'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('speech-to-text')!

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}
interface SpeechRecognitionResultList { length: number; item(i:number): SpeechRecognitionResult; [i:number]: SpeechRecognitionResult }
interface SpeechRecognitionResult { isFinal: boolean; [i:number]: SpeechRecognitionAlternative }
interface SpeechRecognitionAlternative { transcript: string; confidence: number }
interface SpeechRecognitionErrorEvent extends Event { error: string }

const LANGS = [
  { code:'en-US', label:'English (US)' },
  { code:'en-GB', label:'English (UK)' },
  { code:'ko-KR', label:'Korean' },
  { code:'ja-JP', label:'Japanese' },
  { code:'zh-CN', label:'Chinese (Simplified)' },
  { code:'es-ES', label:'Spanish' },
  { code:'fr-FR', label:'French' },
  { code:'de-DE', label:'German' },
  { code:'pt-BR', label:'Portuguese (BR)' },
]

export default function SpeechToTextPage({ params }: { params: { lang: string } }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [lang, setLang] = useState('en-US')
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const recRef = useRef<SpeechRecognition|null>(null)
  const tracked = useRef(false)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  const startListening = useCallback(() => {
    if (!tracked.current) { trackToolUsed('speech-to-text'); tracked.current = true }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setError('')
    const rec = new SR()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let final = '', inter = ''
      for (let i=e.resultIndex;i<e.results.length;i++) {
        const res = e.results[i]
        if (res.isFinal) final += res[0].transcript
        else inter += res[0].transcript
      }
      if (final) setTranscript(t=>t+final)
      setInterim(inter)
    }
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(e.error==='not-allowed'?'Microphone access denied. Please allow microphone access and try again.':'Error: '+e.error)
      setIsListening(false)
    }
    rec.onend = () => { setIsListening(false); setInterim('') }
    recRef.current = rec
    rec.start()
    setIsListening(true)
  }, [lang])

  const stopListening = useCallback(() => {
    recRef.current?.stop()
    setIsListening(false)
    setInterim('')
  }, [])

  async function copy() {
    await navigator.clipboard.writeText(transcript)
    trackToolCopy('speech-to-text')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!supported ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Speech recognition is not supported in this browser. Please use Chrome or Edge.
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-center flex-wrap">
              <select value={lang} onChange={e=>setLang(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                {LANGS.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button onClick={isListening?stopListening:startListening}
                className={'px-6 py-2 rounded-xl font-semibold text-sm transition-colors ' + (isListening?'bg-red-500 hover:bg-red-600 text-white':'bg-brand-600 hover:bg-brand-700 text-white')}>
                {isListening ? '\u23F9 Stop' : '\uD83C\uDFA4 Start Recording'}
              </button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-brand-600">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening...
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Transcript</label>
                <div className="flex gap-2">
                  {transcript && <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>}
                  {transcript && <button onClick={()=>setTranscript('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-24 whitespace-pre-wrap">
                {transcript}
                {interim && <span className="text-gray-400">{interim}</span>}
                {!transcript && !interim && <span className="text-gray-400 italic">Your speech will appear here...</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
