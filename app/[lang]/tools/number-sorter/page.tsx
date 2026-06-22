'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-sorter')!
export default function NumberSorterPage() {
  const [input,setInput]=useState('5, 2, 8, 1, 9, 3, 7, 4, 6, 10')
  const [order,setOrder]=useState<'asc'|'desc'>('asc')
  const [sep,setSep]=useState<'comma'|'newline'|'space'>('comma')
  const [unique,setUnique]=useState(false)
  const [remove0,setRemove0]=useState(false)
  const [copied,setCopied]=useState(false)
  const sepChar=sep==='comma'?',':sep==='newline'?'
':' '
  const parsed=(sep==='comma'?input.split(','):sep==='newline'?input.split('
'):input.split(/s+/)).map(s=>s.trim()).filter(Boolean).map(Number).filter(n=>!isNaN(n))
  let nums=[...parsed]
  if(remove0)nums=nums.filter(n=>n!==0)
  if(unique)nums=[...new Set(nums)]
  nums.sort((a,b)=>order==='asc'?a-b:b-a)
  const out=nums.join(sepChar+(sep!=='newline'?' ':''))
  const copy=()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const stats=nums.length>0?{min:Math.min(...nums),max:Math.max(...nums),sum:nums.reduce((a,b)=>a+b,0),avg:parseFloat((nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(4))}:null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Numbers</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"
            placeholder="Enter numbers..."/></div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg overflow-hidden border border-gray-300 text-sm">
            <button onClick={()=>setOrder('asc')} className={'px-3 py-2 font-medium transition '+(order==='asc'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Ascending</button>
            <button onClick={()=>setOrder('desc')} className={'px-3 py-2 font-medium transition '+(order==='desc'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Descending</button>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-600">Sep:</span>
            {[{l:'Comma',v:'comma'},{l:'Newline',v:'newline'},{l:'Space',v:'space'}].map(s=>(
              <button key={s.v} onClick={()=>setSep(s.v as any)}
                className={'px-2.5 py-1.5 rounded border text-xs transition '+(sep===s.v?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          {[['Remove duplicates',unique,setUnique],['Remove zeros',remove0,setRemove0]].map(([l,v,s])=>(
            <label key={l as string} className="flex items-center gap-1.5 cursor-pointer text-gray-600">
              <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{l as string}
            </label>
          ))}
        </div>
        {stats&&(
          <div className="grid grid-cols-4 gap-2 text-center">
            {[['Count',nums.length],['Min',stats.min],['Max',stats.max],['Avg',stats.avg]].map(([l,v])=>(
              <div key={l} className="bg-gray-50 rounded-xl py-2.5">
                <p className="text-lg font-bold text-gray-800 font-mono">{v}</p>
                <p className="text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
        )}
        <div className="bg-gray-900 rounded-xl p-4 flex gap-3">
          <pre className="flex-1 text-green-400 font-mono text-sm whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{out||'No valid numbers'}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs h-fit hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}