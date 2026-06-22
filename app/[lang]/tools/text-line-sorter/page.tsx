'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-line-sorter')!
export default function TextLineSorterPage() {
  const [input,setInput]=useState('Banana
Apple
Cherry
Date
Elderbery
Fig
Grape')
  const [order,setOrder]=useState<'asc'|'desc'>('asc')
  const [caseI,setCaseI]=useState(true)
  const [trim,setTrim]=useState(true)
  const [unique,setUnique]=useState(false)
  const [numeric,setNumeric]=useState(false)
  const [removeEmpty,setRemoveEmpty]=useState(true)
  const [copied,setCopied]=useState(false)
  const result=useMemo(()=>{
    let lines=input.split('
')
    if(trim)lines=lines.map(l=>l.trim())
    if(removeEmpty)lines=lines.filter(Boolean)
    if(unique)lines=[...new Set(lines)]
    lines.sort((a,b)=>{
      if(numeric){const na=parseFloat(a),nb=parseFloat(b);if(!isNaN(na)&&!isNaN(nb))return order==='asc'?na-nb:nb-na}
      const ca=caseI?a.toLowerCase():a,cb=caseI?b.toLowerCase():b
      return order==='asc'?ca.localeCompare(cb):cb.localeCompare(ca)
    })
    return lines
  },[input,order,caseI,trim,unique,numeric,removeEmpty])
  const copy=()=>{navigator.clipboard.writeText(result.join('
'));setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg overflow-hidden border border-gray-300 text-sm">
            <button onClick={()=>setOrder('asc')} className={'px-3 py-2 font-medium transition '+(order==='asc'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>A → Z</button>
            <button onClick={()=>setOrder('desc')} className={'px-3 py-2 font-medium transition '+(order==='desc'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Z → A</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['Case insensitive',caseI,setCaseI],['Trim spaces',trim,setTrim],['Remove duplicates',unique,setUnique],['Remove empty',removeEmpty,setRemoveEmpty],['Numeric sort',numeric,setNumeric]].map(([l,v,s])=>(
              <label key={l as string} className="flex items-center gap-1 cursor-pointer text-xs text-gray-600 border border-gray-200 rounded-full px-2 py-1">
                <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{l as string}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Input ({input.split('
').filter(Boolean).length} lines)</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"
              placeholder="Enter lines to sort..."/></div>
          <div><div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Result ({result.length} lines)</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 h-60 overflow-y-auto">
              {result.map((l,i)=>(
                <div key={i} className={'px-3 py-1.5 text-sm font-mono border-b border-gray-100 last:border-0 '+(i%2===0?'bg-white':'')}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}