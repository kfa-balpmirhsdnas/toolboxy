'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function genFib(n:number):bigint[]{
  const seq:bigint[]=[0n,1n]
  for(let i=2;i<n;i++) seq.push(seq[i-1]+seq[i-2])
  return seq.slice(0,n)
}


const tool = getToolBySlug('fibonacci-generator')!

export default function FibonacciGeneratorPage() {
  const [count, setCount] = useState(20)
  const [find, setFind] = useState('')
  const [copied, setCopied] = useState(false)

  const seq = genFib(Math.min(count,100))
  const findNum = find ? BigInt(find) : null
  const findIdx = findNum!==null ? seq.indexOf(findNum) : -1
  const isFib = findIdx !== -1

  function copy(){navigator.clipboard.writeText(seq.join(', '));setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fibonacci Generator</h1>
        <p className="text-gray-500 mb-8">Generate Fibonacci sequences and check if a number is a Fibonacci number</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Number of terms</label>
              <span className="text-brand-600 font-semibold">{Math.min(count,100)}</span>
            </div>
            <input type="range" min={2} max={100} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check if a number is Fibonacci</label>
            <input type="text" value={find} onChange={e=>setFind(e.target.value.replace(/[^0-9]/g,''))} placeholder="Enter a number..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {find&&(
              <p className={'text-sm mt-1 font-medium '+(isFib?'text-green-600':'text-red-500')}>
                {isFib?'\u2713 Yes! F('+findIdx+') is a Fibonacci number':'\u00D7 Not a Fibonacci number in this range'}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Sequence (F0 to F{seq.length-1})</h2>
            <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy All'}</button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {seq.map((n,i)=>(
              <div key={i}
                className={'px-3 py-1.5 rounded-lg text-sm font-mono '+(findNum!==null&&n===findNum?'bg-brand-500 text-white font-bold':'bg-gray-50 text-gray-700')}>
                {n.toString()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}