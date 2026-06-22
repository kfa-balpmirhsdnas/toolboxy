'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('roman-numeral-converter')!

const VALS: [number, string][] = [
  [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],
  [100,'C'],[90,'XC'],[50,'L'],[40,'XL'],
  [10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I'],
]

function toRoman(n: number): string {
  if (n < 1 || n > 3999) return 'Out of range (1–3999)'
  let result = ''
  let num = n
  for (const [val, sym] of VALS) {
    while (num >= val) { result += sym; num -= val }
  }
  return result
}

function fromRoman(s: string): number | null {
  const upper = s.toUpperCase().trim()
  if (!/^[IVXLCDM]+$/.test(upper)) return null
  const map: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 }
  let result = 0
  for (let i = 0; i < upper.length; i++) {
    const cur = map[upper[i]], next = map[upper[i+1]]
    if (next && cur < next) result -= cur
    else result += cur
  }
  return result > 0 ? result : null
}

export default function RomanNumeralConverterPage({ params }: { params: { lang: string } }) {
  const [mode, setMode] = useState<'to-roman'|'from-roman'>('to-roman')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('roman-numeral-converter'); tracked.current = true }
  }

  const numVal = parseInt(input)
  const output = (() => {
    if (!input.trim()) return ''
    if (mode === 'to-roman') {
      if (isNaN(numVal)) return 'Enter a number'
      return toRoman(numVal)
    } else {
      const n = fromRoman(input)
      return n !== null ? String(n) : 'Invalid Roman numeral'
    }
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('roman-numeral-converter')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex gap-2">
          {([['to-roman','Number \u2192 Roman'],['from-roman','Roman \u2192 Number']] as [typeof mode, string][]).map(([m,label]) => (
            <button key={m} onClick={() => { setMode(m); setInput('') }}
              className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); track() }}
          placeholder={mode === 'to-roman' ? 'e.g. 2024' : 'e.g. MMXXIV'}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {output && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-600 font-medium mb-0.5">Result</p>
              <p className="text-3xl font-bold tracking-wide text-brand-800">{output}</p>
            </div>
            {!/range|invalid|Enter/.test(output) && (
              <button onClick={copy} className="px-3 py-1.5 bg-brand-600 text-white text-xs rounded-lg hover:bg-brand-700">
                {copied ? '\u2713 Copied' : 'Copy'}
              </button>
            )}
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick Reference</p>
          <div className="grid grid-cols-4 gap-1 text-xs font-mono">
            {VALS.map(([v, s]) => (
              <div key={s} className="flex gap-1.5"><span className="text-brand-600 w-8">{s}</span><span className="text-gray-500">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
