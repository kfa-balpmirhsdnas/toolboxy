'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('morse-code-converter')!

const MORSE: Record<string, string> = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',
  I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',
  Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',
  Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..',"!":'-.-.--',"/":'-..-.','(':'-.--.',")":'-.--.-'
}
const REVERSE: Record<string, string> = {}
Object.entries(MORSE).forEach(([k,v]) => { REVERSE[v] = k })

export default function MorseCodeConverterPage() {
  const [mode, setMode] = useState<'toMorse'|'fromMorse'>('toMorse')
  const [input, setInput] = useState('')

  function convert(text: string, m: 'toMorse'|'fromMorse') {
    if (m === 'toMorse') {
      return text.toUpperCase().split('').map(c => c === ' ' ? '/' : (MORSE[c] || '?')).join(' ')
    } else {
      return text.trim().split('/').map(word =>
        word.trim().split(' ').filter(Boolean).map(code => REVERSE[code] || '?').join('')
      ).join(' ')
    }
  }

  const output = convert(input, mode)

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['toMorse','fromMorse'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setInput('') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${mode===m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {m === 'toMorse' ? 'Text → Morse' : 'Morse → Text'}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'toMorse' ? 'Text Input' : 'Morse Input (space between letters, / between words)'}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'toMorse' ? 'Type text here...' : '... --- ...'}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
          <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm text-gray-800 min-h-[80px] break-all whitespace-pre-wrap">
            {output || <span className="text-gray-400 font-sans">Output appears here...</span>}
          </div>
        </div>
        {output && (
          <button
            onClick={() => navigator.clipboard.writeText(output)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >Copy</button>
        )}
      </div>
    </ToolLayout>
  )
}