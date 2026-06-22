'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('random-number-generator')!

export default function RandomNumberGeneratorPage() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(1)
  const [unique, setUnique] = useState(false)
  const [results, setResults] = useState<number[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function generate() {
    setError('')
    if (min >= max) { setError('Min must be less than Max'); return }
    if (count < 1 || count > 10000) { setError('Count must be between 1 and 10,000'); return }
    const range = max - min + 1
    if (unique && count > range) { setError('Cannot generate '+count+' unique numbers in range '+min+' to '+max); return }
    const nums: number[] = []
    if (unique) {
      const pool = Array.from({length: range}, (_,i) => min+i)
      for (let i = pool.length-1; i > 0; i--) { const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]] }
      nums.push(...pool.slice(0,count))
    } else {
      for (let i=0;i<count;i++) nums.push(Math.floor(Math.random()*range)+min)
    }
    setResults(nums)
  }

  function copy() {
    navigator.clipboard.writeText(results.join(', '))
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Random Number Generator</h1>
        <p className="text-gray-500 mb-8">Generate random integers in a custom range — supports unique numbers and bulk generation</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
              <input type="number" value={min} onChange={e=>setMin(parseInt(e.target.value)||0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
              <input type="number" value={max} onChange={e=>setMax(parseInt(e.target.value)||100)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <input type="number" min={1} max={10000} value={count} onChange={e=>setCount(parseInt(e.target.value)||1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={unique} onChange={e=>setUnique(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">No duplicates (unique numbers only)</span>
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={generate} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Generate</button>
        </div>
        {results.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">{results.length} Number{results.length>1?'s':''} Generated</span>
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy All'}</button>
            </div>
            {results.length === 1 ? (
              <div className="text-6xl font-bold text-brand-600 text-center py-4">{results[0]}</div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {results.map((n,i)=>(
                  <span key={i} className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-lg text-brand-700 font-mono text-sm">{n}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}