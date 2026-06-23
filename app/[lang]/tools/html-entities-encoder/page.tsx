'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
const MAP:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','©':'&copy;','®':'&reg;','™':'&trade;','€':'&euro;','£':'&pound;'}
const RMAP=Object.fromEntries(Object.entries(MAP).map(([k,v])=>[v,k]))
function encode(s:string){return s.replace(/[&<>"'©®™€£]/g,m=>MAP[m]||m)}
function decode(s:string){return s.replace(/&[a-z]+;|&#[0-9]+;/gi,m=>RMAP[m]||m)}
export default function Page(){
  const [input,setInput]=useState('')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const output=mode==='encode'?encode(input):decode(input)
  const tool=TOOLS.find(t=>t.slug==='html-entities-encoder')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-2">
          {(['encode','decode'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)} className={'px-4 py-2 rounded-lg text-sm font-medium '+(mode===m?'bg-blue-600 text-white':'border border-gray-300 hover:bg-gray-50 text-gray-700')}>
              {m==='encode'?'HTML Encode':'HTML Decode'}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Input</p>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10} placeholder={mode==='encode'?'Plain text...':'HTML entities...'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Output</p>
            <textarea value={output} readOnly rows={10} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono resize-none"/></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>navigator.clipboard?.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
          <button onClick={()=>setInput(output)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Swap</button>
        </div>
      </div>
    </ToolLayout>
  )
}