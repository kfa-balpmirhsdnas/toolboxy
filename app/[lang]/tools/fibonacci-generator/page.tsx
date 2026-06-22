'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('fibonacci-generator')!
function fibonacci(n:number):bigint[]{
  const seq:bigint[]=[0n,1n]
  for(let i=2;i<n;i++)seq.push(seq[i-1]+seq[i-2])
  return seq.slice(0,n)
}
export default function FibonacciGeneratorPage() {
  const [count,setCount]=useState(15)
  const [copied,setCopied]=useState(false)
  const seq=fibonacci(Math.min(count,200))
  const copy=()=>{navigator.clipboard.writeText(seq.join(', '));setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of terms (max 200)</label>
          <div className="flex items-center gap-3">
            <input type="range" min="2" max="200" value={count} onChange={e=>setCount(Number(e.target.value))} className="flex-1"/>
            <span className="w-12 text-center font-mono text-lg font-bold text-blue-700">{count}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {seq.map((n,i)=>(
              <span key={i} className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-mono">
                {n.toString()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700">
            {copied?'Copied!':'Copy All'}
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>F({count-1})</strong> = {seq[seq.length-1].toString()}
        </div>
      </div>
    </ToolLayout>
  )
}