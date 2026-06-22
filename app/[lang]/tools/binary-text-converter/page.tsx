'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('binary-text-converter')!

function textToBinary(text: string): string {
  return Array.from(text).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
}

function binaryToText(bin: string): string {
  const clean = bin.trim().replace(/[^01\s]/g, '')
  const groups = clean.split(/\s+/).filter(g => g.length > 0)
  return groups.map(g => String.fromCharCode(parseInt(g.padStart(8, '0'), 2))).join('')
}

function isValidBinary(s: string): boolean {
  return /^[01\s]+$/.test(s.trim()) && s.trim().length > 0
}

export default function BinaryTextConverterPage({ params }: { params: { lang: string } }) {
  const [mode, setMode] = useState<'to-binary' | 'to-text'>('to-binary')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('binary-text-converter'); tracked.current = true }
  }

  const output = (() => {
    if (!input.trim()) return ''
    if (mode === 'to-binary') return textToBinary(input)
    if (!isValidBinary(input)) return ''
    return binaryToText(input)
  })()

  const isError = mode === 'to-text' && input.trim() && !isValidBinary(input)

  async function copy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    trackToolCopy('binary-text-converter')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function swap() {
    if (output) {
      setInput(output)
      setMode(m => m === 'to-binary' ? 'to-text' : 'to-binary')
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex gap-2">
          {([['to-binary', 'Text \u2192 Binary'], ['to-text', 'Binary \u2192 Text']] as const).map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setInput('') }}
              className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {mode === 'to-binary' ? 'Text Input' : 'Binary Input (space-separated 8-bit groups)'}
          </label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); track() }}
            placeholder={mode === 'to-binary' ? 'Hello World' : '01001000 01100101 01101100 01101100 01101111'}
            rows={4}
            className={'w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (isError ? 'border-red-300' : 'border-gray-200')}
          />
          {isError && <p className="mt-1 text-xs text-red-600">Input must contain only 0s, 1s, and spaces</p>}
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">
                {mode === 'to-binary' ? 'Binary Output' : 'Text Output'}
              </label>
              <div className="flex gap-2">
                <button onClick={swap} className="text-xs text-gray-500 hover:underline">&#x21C4; Swap</button>
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">
                  {copied ? '\u2713 Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-800 break-all max-h-48 overflow-y-auto">
              {output}
            </div>
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1.5">Quick Reference</p>
          <div className="grid grid-cols-2 gap-1 text-xs font-mono">
            {[['A','01000001'],['a','01100001'],['0','00110000'],['space','00100000']].map(([ch, bin]) => (
              <div key={ch} className="flex gap-2"><span className="text-brand-600 w-10">{ch}</span><span className="text-gray-500">{bin}</span></div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
