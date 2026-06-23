'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-case-converter')!
function toCase(t,mode){
  const w=t.split(/[\s_-]+/)
  if(mode==='upper')return t.toUpperCase()
  if(mode==='lower')return t.toLowerCase()
  if(mode==='title')return t.toLowerCase().replace(/(?:^|\s)\S/g,c=>c.toUpperCase())
  if(mode==='sentence')return t.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g,c=>c.toUpperCase())
  if(mode==='camel')return w.map((v,i)=>i===0?v.toLowerCase():v.charAt(0).toUpperCase()+v.slice(1).toLowerCase()).join('')
  if(mode==='pascal')return w.map(v=>v.charAt(0).toUpperCase()+v.slice(1).toLowerCase()).join('')
  if(mode==='snake')return w.map(v=>v.toLowerCase()).join('_')
  if(mode==='kebab')return w.map(v=>v.toLowerCase()).join('-')
  return t
}
export default function TextCaseConverterPage() {
  const [input,setInput]=useState('Hello World Example Text')
  const [mode,setMode]=useState('upper')
  const [ok,setOk]=useState(false)
  const modes=[{v:'upper',l:'UPPER CASE'},{v:'lower',l:'lower case'},{v:'title',l:'Title Case'},{v:'sentence',l:'Sentence case'},{v:'camel',l:'camelCase'},{v:'pascal',l:'PascalCase'},{v:'snake',l:'snake_case'},{v:'kebab',l:'kebab-case'}]
  const out=toCase(input,mode)
  const copy=()=>{navigator.clipboard.writeText(out);setOk(true);setTimeout(()=>setOk(false),2000)}
  return (<ToolLayout tool={tool}><div className="max-w-2xl mx-auto px-4 space-y-4"><textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} className="w-full p-3 border rounded-lg font-mono text-sm resize-y" placeholder="Enter text..."/><div className="flex flex-wrap gap-2">{modes.map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${mode===m.v?'bg-blue-600 text-white':'bg-white text-gray-700 border-gray-300'}`}>{m.l}</button>))}</div><div className="relative bg-gray-50 border rounded-lg p-4"><pre className="font-mono text-sm whitespace-pre-wrap">{out}</pre><button onClick={copy} className="absolute top-3 right-3 text-xs bg-blue-600 text-white px-3 py-1 rounded">{ok?'Copied!':'Copy'}</button></div></div></ToolLayout>)
}