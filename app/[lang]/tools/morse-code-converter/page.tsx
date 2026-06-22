'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('morse-code-converter')!

const MORSE: Record<string, string> = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....', I:'..', J:'.---',
  K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-',
  U:'..-', V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',
  ';':'-.-.-.','=':'-...-','+':'.-.-.','\u2013':'-....-','_':'..--.-',''':'.----.','"':'.-..-.','$':'...-..-','@':'.--.-.','\u00D7':'-..-'
}
const REV: Record<string, string> = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]))

function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(c => {
    if (c === ' ') return '/'
    return MORSE[c] || '?'
  }).join(' ')
}

function morseToText(morse: string): string {
  return morse.split(' / ').map(word =>
    word.split(' ').map(code => REV[code] || '?').join('')
  ).join(' ')
}

export default function MorseCodeConverterPage({ params }: { params: { lang: string } }) {
  const [mode, setMode] = useState<'to-morse'|'from-morse'>('to-morse')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('morse-code-converter'); tracked.current = true }
  }

  const output = !input.trim() ? '' : mode === 'to-morse' ? textToMorse(input) : morseToText(input)

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('morse-code-converter')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['to-morse','Text \u2192 Morse'],['from-morse','Morse \u2192 Text']] as [typeof mode, string][]).map(([m,label]) => (
            <button key={m} onClick={() => { setMode(m); setInput('') }}
              className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); track() }}
          placeholder={mode === 'to-morse' ? 'Type text to convert...' : 'Enter morse code (use / for word breaks)...'}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Result</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? '\u2713 Copied' : 'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 break-all leading-loose">
              {output}
            </div>
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono">
          <p className="font-semibold text-gray-600 mb-2">Quick Reference</p>
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(MORSE).slice(0,26).map(([k,v]) => (
              <span key={k} className="text-gray-600"><span className="text-brand-700 font-bold">{k}</span> {v}</span>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
