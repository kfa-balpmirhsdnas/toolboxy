'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('random-number-generator')!

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomFloat(min: number, max: number, decimals: number): string {
  return (Math.random() * (max - min) + min).toFixed(decimals)
}

export default function RandomNumberGeneratorPage({ params }: { params: { lang: string } }) {
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState('1')
  const [mode, setMode] = useState<'integer' | 'float'>('integer')
  const [decimals, setDecimals] = useState('2')
  const [unique, setUnique] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const tracked = useRef(false)

  function generate() {
    if (!tracked.current) { trackToolUsed('random-number-generator'); tracked.current = true }
    const mn = parseFloat(min)
    const mx = parseFloat(max)
    const cnt = Math.min(parseInt(count) || 1, 1000)
    if (isNaN(mn) || isNaN(mx) || mn >= mx) { setError('Min must be less than Max'); return }
    setError('')

    if (mode === 'integer') {
      if (unique && (mx - mn + 1) < cnt) { setError('Range too small for unique numbers'); return }
      if (unique) {
        const pool = Array.from({ length: Math.floor(mx - mn) + 1 }, (_, i) => Math.floor(mn) + i)
        const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, cnt)
        setResults(shuffled.map(String))
      } else {
        setResults(Array.from({ length: cnt }, () => String(getRandomInt(Math.ceil(mn), Math.floor(mx)))))
      }
    } else {
      setResults(Array.from({ length: cnt }, () => getRandomFloat(mn, mx, parseInt(decimals) || 2)))
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(results.join('\n'))
    trackToolCopy('random-number-generator')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex gap-2">
          {(['integer', 'float'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m === 'integer' ? 'Integer' : 'Decimal'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['Min', min, setMin], ['Max', max, setMax]].map(([label, val, set]) => (
            <div key={label as string}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
              <input type="number" value={val as string} onChange={e => (set as (v:string)=>void)(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Count (max 1000)</label>
            <input type="number" min="1" max="1000" value={count} onChange={e => setCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          {mode === 'float' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Decimal Places</label>
              <input type="number" min="0" max="10" value={decimals} onChange={e => setDecimals(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          )}
          {mode === 'integer' && (
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="unique" checked={unique} onChange={e => setUnique(e.target.checked)}
                className="w-4 h-4 accent-brand-600" />
              <label htmlFor="unique" className="text-sm text-gray-600">No duplicates</label>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button onClick={generate}
          className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">
          Generate
        </button>
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{results.length} number{results.length > 1 ? 's' : ''}</span>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">
                {copied ? '\u2713 Copied' : 'Copy all'}
              </button>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-800 max-h-48 overflow-y-auto">
              {results.length === 1 ? (
                <p className="text-2xl font-bold text-brand-700 text-center py-2">{results[0]}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.map((n, i) => (
                    <span key={i} className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs">{n}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
