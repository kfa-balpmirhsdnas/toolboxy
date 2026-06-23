'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('list-randomizer')!
function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]};return a}
const SAMPLES=['Alice\nBob
Carol
Dave
Eve','Red
Green
Blue
Yellow
Purple','Apple
Banana
Cherry
Date
Elderbery']\nexport default function ListRandomizerPage() {
  const [input,setInput]=useState('Alice\nBob
Carol
Dave
Eve')\n  const [result,setResult]=useState<string[]>([])
  const [numPick,setNumPick]=useState(0)
  const [copied,setCopied]=useState(false)
  const [highlight,setHighlight]=useState(-1)
  const lines=input.split('\n').map(s=>s.trim()).filter(Boolean)\n  const go=()=>{\n    const s=shuffle(lines)\n    const out=numPick>0&&numPick<=s.length?s.slice(0,numPick):s\n    setResult(out);setHighlight(0)\n    setTimeout(()=>setHighlight(-1),800)\n  }\n  const copy=()=>{navigator.clipboard.writeText(result.join('
'));setCopied(true);setTimeout(()=>setCopied(false),1500)}\n  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Items (one per line)</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
              placeholder="Enter items..."/></div>
          {result.length>0&&(
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Shuffled order</label>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {result.map((item,i)=>(
                  <div key={i} className={'flex items-center gap-2 px-3 py-2 text-sm transition '+(i===highlight?'bg-yellow-100':i%2===0?'bg-gray-50':'bg-white')}>
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    <span className="text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Pick top:</span>
            <input type="number" value={numPick||''} onChange={e=>setNumPick(Number(e.target.value))} min="0" max={lines.length} placeholder="all"
              className="w-16 rounded border border-gray-300 px-2 py-1.5 text-center text-sm"/>
          </div>
          <button onClick={go} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Shuffle!</button>
          {result.length>0&&<button onClick={copy} className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">{copied?'Copied!':'Copy'}</button>}
        </div>
        <div className="flex gap-1.5">
          {SAMPLES.map((s,i)=>(
            <button key={i} onClick={()=>setInput(s)} className="px-2.5 py-1 rounded-full border border-gray-200 text-xs hover:bg-gray-50 text-gray-600">Sample {i+1}</button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">{lines.length} items</p>
      </div>
    </ToolLayout>
  )
}