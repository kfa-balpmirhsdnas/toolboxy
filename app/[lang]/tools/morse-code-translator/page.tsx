'use client'
import { useState, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('morse-code-translator')!

const MORSE: Record<string,string> = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
  'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
  'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..',''':'.----.','!':'-.-.--','/':'-..-.','(':'-.--.',')'':'-.--.-',
  '&':'.-...', ':':'---...', ';':'-.-.-.', '=':'-...-', '+':'.-.-.', '-':'-....-', '_':'..--.-',
  '"':'.-..-.', '$':'...-..-', '@':'.--.-.', '\u00E0':'.--.-', '\u00E9':'..-..', '\u00E6':'.-.-', '\u00F8':'---.', '\u00E5':'.--.-',
}

const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))

function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(c => {
    if (c === ' ') return '/'
    return MORSE[c] || '?'
  }).join(' ')
}

function morseToText(morse: string): string {
  return morse.split(' / ').map(word =>
    word.split(' ').map(code => REVERSE[code] || (code==='?'?'?':'')).join('')
  ).join(' ')
}

export default function MorseCodeTranslatorPage({ params }: { params: { lang: string } }) {
  const [mode, setMode] = useState<'text-to-morse'|'morse-to-text'>('text-to-morse')
  const [input, setInput] = useState('HELLO WORLD')
  const [copied, setCopied] = useState(false)
  const [playing, setPlaying] = useState(false)
  const tracked = useRef(false)
  const audioCtxRef = useRef<AudioContext|null>(null)

  function track() { if (!tracked.current) { trackToolUsed('morse-code-translator'); tracked.current = true } }

  const output = mode==='text-to-morse' ? textToMorse(input) : morseToText(input)

  async function copy() { await navigator.clipboard.writeText(output); trackToolCopy('morse-code-translator'); setCopied(true); setTimeout(()=>setCopied(false),1500) }

  const playMorse = useCallback(async () => {
    const morse = mode==='text-to-morse' ? output : textToMorse(input)
    if (playing || !morse) return
    setPlaying(true); track()
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const wpm = 20; const dotDuration = 1200/wpm/1000
    let t = ctx.currentTime + 0.1

    for (const char of morse.split('')) {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.value = 600
      let dur = 0
      if (char==='.') dur=dotDuration
      else if (char==='-') dur=dotDuration*3
      else if (char===' ') { t+=dotDuration; continue }
      else if (char==='/') { t+=dotDuration*7; continue }
      if (!dur) continue
      gain.gain.setValueAtTime(0.3,t)
      osc.start(t); osc.stop(t+dur)
      gain.gain.setValueAtTime(0.3,t); gain.gain.linearRampToValueAtTime(0,t+dur)
      t+=dur+dotDuration
    }
    setTimeout(()=>setPlaying(false),(t-ctx.currentTime+0.5)*1000)
  },[mode,output,input,playing])

  const PRESETS = [
    { label:'SOS', value:mode==='text-to-morse'?'SOS':'... --- ...' },
    { label:'Hi', value:mode==='text-to-morse'?'HI':'.... ..' },
    { label:'Love', value:mode==='text-to-morse'?'LOVE':'.-.. --- ...- .' },
  ]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-1">
          {(['text-to-morse','morse-to-text'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setInput('');track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m==='text-to-morse'?'Text → Morse':'Morse → Text'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setInput(p.value);track()}}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs">
              {p.label}
            </button>
          ))}
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={3}
          placeholder={mode==='text-to-morse'?'Enter text...':'Enter morse code (use / for word separator)...'}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output</label>
              <div className="flex gap-2">
                {mode==='text-to-morse' && (
                  <button onClick={playMorse} disabled={playing}
                    className={'text-xs transition-colors ' + (playing?'text-gray-400':'text-brand-600 hover:underline')}>
                    {playing?'♪ Playing...':'▶ Play'}
                  </button>
                )}
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy'}</button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono break-all leading-relaxed">{output}</div>
          </div>
        )}
        {mode==='text-to-morse' && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-600 mb-2">Reference</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
              {Object.entries(MORSE).slice(0,36).map(([k,v])=>(
                <div key={k} className="p-1.5 bg-gray-50 rounded-lg text-center">
                  <span className="text-xs font-bold text-gray-700">{k}</span>
                  <span className="block text-xs font-mono text-gray-500">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
