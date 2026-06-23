'use client'
import {useState} from 'react'
import ToolLayout from '@/components/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [input,setInput]=useState('banana\napple\ncherry\ndate\nelderberry')
  const [mode,setMode]=useState('asc')
  const [cs,setCs]=useState(false)
  const [dedup,setDedup]=useState(false)
  const getOut=()=>{
    let lines=input.split('\n')
    if(dedup)lines=[...new Set(lines)]
    if(mode==='shuffle'){for(let i=lines.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lines[i],lines[j]]=[lines[j],lines[i]]};return lines.join('\n')}
    const k=s=>cs?s:s.toLowerCase()
    lines.sort((a,b)=>mode==='len'?k(a).length-k(b).length:k(a)<k(b)?-1:k(a)>k(b)?1:0)
    if(mode==='desc')lines.reverse()
    return lines.join('\n')
  }
  const out=getOut()
  const MODES=[['asc','A→Z'],['desc','Z→A'],['len','Length'],['shuffle','Shuffle']]
  const tool=TOOLS.find(t=>t.slug==='text-line-sorter')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {MODES.map(([m,lbl])=><button key={m} onClick={()=>setMode(m)} className={'px-3 py-1 rounded text-sm font-medium border '+(mode===m?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-700 hover:bg-gray-50')}>{lbl}</button>)}
          <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={cs} onChange={e=>setCs(e.target.checked)}/>Case-sensitive</label>
          <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={dedup} onChange={e=>setDedup(e.target.checked)}/>Remove duplicates</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
            <textarea value={out} readOnly rows={10} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
        </div>
        <button onClick={()=>navigator.clipboard?.writeText(out)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
      </div>
    </ToolLayout>
  )
}