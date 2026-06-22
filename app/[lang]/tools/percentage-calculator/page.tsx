'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('percentage-calculator')!

interface Calc { label: string; formula: string; result: string }

export default function PercentageCalculatorPage({ params }: { params: { lang: string } }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')
  const [d, setD] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('percentage-calculator'); tracked.current = true }
  }

  const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c), dv = parseFloat(d)

  const results: Calc[] = [
    {
      label: 'X% of Y',
      formula: (isNaN(av)||isNaN(bv)) ? '' : av + '% of ' + bv,
      result: (isNaN(av)||isNaN(bv)) ? '' : ((av / 100) * bv).toFixed(4).replace(/\.?0+$/, ''),
    },
    {
      label: 'X is what % of Y',
      formula: (isNaN(cv)||isNaN(dv)||dv===0) ? '' : cv + ' is what % of ' + dv,
      result: (isNaN(cv)||isNaN(dv)||dv===0) ? '' : ((cv / dv) * 100).toFixed(4).replace(/\.?0+$/, '') + '%',
    },
    {
      label: '% change from X to Y',
      formula: (isNaN(cv)||isNaN(dv)||cv===0) ? '' : cv + ' \u2192 ' + dv,
      result: (isNaN(cv)||isNaN(dv)||cv===0) ? '' :
        (((dv - cv) / Math.abs(cv)) * 100).toFixed(2) + '% ' + (dv >= cv ? '\u2191' : '\u2193'),
    },
  ]

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('percentage-calculator')
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">X% of Y</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" value={a} onChange={e=>{setA(e.target.value);track()}} placeholder="X" className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <span className="text-sm text-gray-500">% of</span>
            <input type="number" value={b} onChange={e=>{setB(e.target.value);track()}} placeholder="Y" className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <span className="text-sm text-gray-500">=</span>
            <span className="text-lg font-bold text-brand-700 min-w-[4rem]">{results[0].result || '?'}</span>
            {results[0].result && (
              <button onClick={() => copy(results[0].result, 'r0')} className="text-xs text-brand-600 hover:underline">{copied==='r0'?'\u2713':'Copy'}</button>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">X is what % of Y / % change from X to Y</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" value={c} onChange={e=>{setC(e.target.value);track()}} placeholder="X" className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <span className="text-sm text-gray-500">and</span>
            <input type="number" value={d} onChange={e=>{setD(e.target.value);track()}} placeholder="Y" className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          {results[1].result && (
            <div className="grid grid-cols-2 gap-3">
              {results.slice(1).map((r, i) => (
                <div key={i} className="p-3 bg-white border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{r.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-brand-700">{r.result}</p>
                    <button onClick={() => copy(r.result, 'r'+(i+1))} className="text-xs text-brand-600 hover:underline">{copied==='r'+(i+1)?'\u2713':'Copy'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
