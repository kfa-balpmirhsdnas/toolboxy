'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]};return a}
export default function Page(){
  const [input,setInput]=useState('Apple
Banana
Cherry
Date
Elderberry')
  const [output,setOutput]=useState<string[]>([])
  const [numbered,setNumbered]=useState(false)
  const randomize=()=>{setOutput(shuffle(input.split('
').filter(l=>l.trim())))}
  const tool=TOOLS.find(t=>t.slug==='list-randomizer')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={numbered} onChange={e=>setNumbered(e.target.checked)} className="rounded"/>Number items</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Items (one per line)</p>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Randomized</p>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono min-h-[220px]">
              {output.length?output.map((l,i)=><div key={i}>{numbered?(i+1)+'. ':''}{l}</div>):<span className="text-gray-400 italic">Click Randomize</span>}
            </div></div>
        </div>
        <div className="flex gap-2">
          <button onClick={randomize} className="px-5 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Randomize</button>
          {output.length>0&&<button onClick={()=>navigator.clipboard?.writeText(output.map((l,i)=>numbered?(i+1)+'. '+l:l).join('
'))} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Copy</button>}
        </div>
      </div>
    </ToolLayout>
  )
}