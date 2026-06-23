'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('duplicate-line-remover')!
export default function DuplicateLineRemoverPage() {
  const [input,setInput]=useState('apple\nbanana
apple
cherry
banana
date
apple
elderbery')\n  const [caseI,setCaseI]=useState(true)
  const [trim,setTrim]=useState(true)
  const [removeEmpty,setRemoveEmpty]=useState(false)
  const [keepFirst,setKeepFirst]=useState(true)
  const [copied,setCopied]=useState(false)
  const [mode,setMode]=useState<'unique'|'dups'>('unique')
  const result=useMemo(()=>{
    const lines=input.split('\n')\n    const seen=new Set<string>()\n    const dups=new Set<string>()\n    for(const l of lines){\n      const key=(trim?l.trim():l)+(caseI?'_lower':'')\n      const k=caseI?key.toLowerCase():key\n      if(seen.has(k))dups.add(k)\n      seen.add(k)\n    }\n    if(mode==='dups'){\n      const dupSeen=new Set<string>()\n      return lines.filter(l=>{\n        const key=(trim?l.trim():l)\n        const k=caseI?key.toLowerCase():key\n        if(!dups.has(k))return false\n        if(keepFirst&&!dupSeen.has(k)){dupSeen.add(k);return false}\n        return true\n      })\n    }\n    const uniqSeen=new Set<string>()\n    return lines.filter(l=>{\n      const key=(trim?l.trim():l)\n      const k=caseI?key.toLowerCase():key\n      if(removeEmpty&&!key)return false\n      if(uniqSeen.has(k))return false\n      uniqSeen.add(k);return true\n    })\n  },[input,caseI,trim,removeEmpty,keepFirst,mode])\n  const copy=()=>{navigator.clipboard.writeText(result.join('
'));setCopied(true);setTimeout(()=>setCopied(false),1500)}\n  const totalLines=input.split('\n').length
  const removed=totalLines-result.length
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('unique')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='unique'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Keep unique lines</button>
          <button onClick={()=>setMode('dups')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='dups'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Show duplicates only</button>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {[['Case insensitive',caseI,setCaseI],['Trim spaces',trim,setTrim],['Remove empty',removeEmpty,setRemoveEmpty]].map(([l,v,s])=>(
            <label key={l as string} className="flex items-center gap-1.5 cursor-pointer text-gray-600">
              <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{l as string}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Input ({totalLines} lines)</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Result ({result.length} lines)</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 h-60 overflow-y-auto">
              {result.map((l,i)=><div key={i} className={'px-3 py-1.5 text-sm font-mono border-b border-gray-100 last:border-0 '+(i%2===0?'bg-white':'')}>{l||' '}</div>)}
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-center">
          {[['Input',totalLines],['Output',result.length],['Removed',removed]].map(([l,v])=>(
            <div key={l} className={'flex-1 rounded-xl py-2.5 '+(l==='Removed'?'bg-red-50':'bg-gray-50')}>
              <p className={'font-bold text-lg '+(l==='Removed'?'text-red-600':'text-gray-800')}>{v}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}