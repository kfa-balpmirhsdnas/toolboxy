'use client'
import { useState } from 'react'

const MORSE: Record<string, string> = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',
  K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',
  U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--',':':'---...',
  ';':'-.-.-.','/':'-..-.','-':'-....-','_':'..--.-',"'":'----.','"':'.-..-.',
  '@':'.--.-.','(':'-.--.',')':'-.--.-'
}
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))

function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(ch => {
    if(ch===' ') return '/'
    return MORSE[ch] || ch
  }).join(' ')
}

function morseToText(morse: string): string {
  return morse.trim().split(' / ').map(word =>
    word.split(' ').map(code => MORSE_REV[code] || '?').join('')
  ).join(' ')
}

const SAMPLE_TEXT = 'Hello World'
const SAMPLE_MORSE = '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'

export default function MorseCodeTranslator() {
  const [mode, setMode] = useState<'textToMorse'|'morseToText'>('textToMorse')
  const [input, setInput] = useState(SAMPLE_TEXT)
  const [copied, setCopied] = useState(false)

  const output = mode === 'textToMorse' ? textToMorse(input) : morseToText(input)

  const swap = () => {
    setInput(output)
    setMode(m => m === 'textToMorse' ? 'morseToText' : 'textToMorse')
  }

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const playMorse = () => {
    const morse = mode === 'textToMorse' ? output : textToMorse(morseToText(input))
    const ctx = new AudioContext()
    let t = ctx.currentTime + 0.1
    const DOT = 0.08, DASH = 0.24, GAP = 0.08, LETTER_GAP = 0.24, WORD_GAP = 0.56
    const beep = (start: number, dur: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 600; osc.type = 'sine'
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.3, start + 0.005)
      gain.gain.setValueAtTime(0.3, start + dur - 0.005)
      gain.gain.linearRampToValueAtTime(0, start + dur)
      osc.start(start); osc.stop(start + dur)
    }
    morse.split(' ').forEach(token => {
      if(token === '/') { t += WORD_GAP; return }
      if(!token) return
      token.split('').forEach((sym, i) => {
        if(sym === '.') { beep(t, DOT); t += DOT + GAP }
        else if(sym === '-') { beep(t, DASH); t += DASH + GAP }
      })
      t += LETTER_GAP
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Morse Code Translator</h1>
        <p className="text-gray-500 mb-8">Translate text to Morse code and back — with audio playback.</p>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={()=>{ setMode('textToMorse'); setInput(SAMPLE_TEXT) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode==='textToMorse'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Text → Morse
          </button>
          <button onClick={swap} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600">⇄</button>
          <button onClick={()=>{ setMode('morseToText'); setInput(SAMPLE_MORSE) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode==='morseToText'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Morse → Text
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
          <div className="px-5 py-3 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">{mode==='textToMorse'?'Text Input':'Morse Input (use dots, dashes, spaces; / for word break)'}</span>
          </div>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            className="w-full p-5 font-mono text-sm resize-none focus:outline-none rounded-b-2xl" rows={4}
            placeholder={mode==='textToMorse'?'Enter text...':'e.g. ... --- ...'}/>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{mode==='textToMorse'?'Morse Output':'Text Output'}</span>
            <div className="flex gap-2">
              {mode==='textToMorse'&&<button onClick={playMorse} className="text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-3 py-1 rounded-lg font-medium">▶ Play</button>}
              <button onClick={copy} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium">{copied?'✓ Copied!':'Copy'}</button>
            </div>
          </div>
          <div className="p-5 font-mono text-sm text-gray-700 min-h-[80px] break-all whitespace-pre-wrap">{output||<span className="text-gray-400">Output will appear here...</span>}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Morse Code Reference</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {Object.entries(MORSE).slice(0,36).map(([ch,code])=>(
              <div key={ch} className="flex gap-1.5 items-center bg-gray-50 rounded-lg px-2 py-1">
                <span className="font-bold text-gray-800 text-xs w-4">{ch}</span>
                <span className="text-gray-500 font-mono text-xs">{code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}