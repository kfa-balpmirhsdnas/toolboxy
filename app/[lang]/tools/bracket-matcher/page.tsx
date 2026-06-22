'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('bracket-matcher')!

type BracketError = { index: number; msg: string }
type BracketResult = { matched: [number,number][]; errors: BracketError[] }

const PAIRS: Record<string,string> = { '(': ')', '[': ']', '{': '}', '<': '>' }
const CLOSE = new Set([')',']','}','>'])

function analyze(text: string, checkAngles: boolean): BracketResult {
  const stack: { char: string; idx: number }[] = []
  const matched: [number,number][] = []
  const errors: BracketError[] = []
  const opens = new Set(checkAngles ? Object.keys(PAIRS) : ['(','[','{'])
  const closes = new Set(checkAngles ? Object.values(PAIRS) : [')',']','}'])

  for (let i=0; i<text.length; i++) {
    const c = text[i]
    if (opens.has(c)) {
      stack.push({ char: c, idx: i })
    } else if (closes.has(c)) {
      if (stack.length === 0) {
        errors.push({ index: i, msg: 'Unexpected ' + c + ' at col '+(i+1) })
      } else {
        const top = stack[stack.length-1]
        if (PAIRS[top.char] === c) {
          stack.pop()
          matched.push([top.idx, i])
        } else {
          errors.push({ index: i, msg: 'Expected ' + PAIRS[top.char] + ', got ' + c + ' at col '+(i+1) })
          stack.pop()
        }
      }
    }
  }
  for (const s of stack) errors.push({ index: s.idx, msg: 'Unclosed ' + s.char + ' at col '+(s.idx+1) })
  return { matched, errors }
}

const COLORS = ['text-blue-600','text-purple-600','text-green-600','text-orange-600','text-pink-600']

export default function BracketMatcherPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('function greet(name: string) {\n  if (name.length > 0) {\n    return `Hello, ${name}!`\n  }\n}')
  const [checkAngles, setCheckAngles] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('bracket-matcher'); tracked.current = true } }

  const result = analyze(input, checkAngles)

  // Build colored spans
  const bracketDepth: Record<number,number> = {}
  let depth = 0
  const sorted = [...result.matched].sort((a,b)=>a[0]-b[0])
  for (const [open,close] of sorted) {
    const d = depth++
    bracketDepth[open] = d % COLORS.length
    bracketDepth[close] = d % COLORS.length
  }
  const errorIdxs = new Set(result.errors.map(e=>e.index))

  const spans: JSX.Element[] = []
  for (let i=0; i<input.length; i++) {
    const c = input[i]
    if (errorIdxs.has(i)) {
      spans.push(<span key={i} className="bg-red-200 text-red-700 font-bold">{c}</span>)
    } else if (bracketDepth[i] !== undefined) {
      spans.push(<span key={i} className={COLORS[bracketDepth[i]] + ' font-bold'}>{c}</span>)
    } else {
      spans.push(<span key={i}>{c}</span>)
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={checkAngles} onChange={e=>{setCheckAngles(e.target.checked);track()}} className="accent-brand-600" />
            Check angle brackets &lt; &gt;
          </label>
          <span className="ml-auto text-xs text-gray-500">{result.matched.length} matched, {result.errors.length} errors</span>
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={8} placeholder="Paste code here..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {result.errors.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium text-sm">
            \u2713 All brackets are matched correctly ({result.matched.length} pairs)
          </div>
        ) : (
          <div className="space-y-2">
            {result.errors.map((e,i)=>(
              <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">{e.msg}</div>
            ))}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Highlighted</label>
          <pre className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-48">{spans}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
