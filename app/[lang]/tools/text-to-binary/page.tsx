'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-to-binary')!
type Mode='binary'|'hex'|'octal'|'decimal'
function textToMode(t:string,m:Mode):string{
  return t.split('').map(c=>{
    const n=c.charCodeAt(0)
    if(m==='binary')return n.toString(2).padStart(8,'0')
    if(m==='hex')return n.toString(16).padStart(2,'0').toUpperCase()
    if(m==='octal')return n.toString(8).padStart(3,'0')
    return String(n)
  }).join(' ')
}
function modeToText(s:string,m:Mode):string{
  try{
    const base=m==='binary'?2:m==='hex'?16:m==='octal'?8:10
    return s.trim().split(/\s+/).map(c=>String.fromCharCode(parseInt(c,base))).join('')
  }catch{return 'Invalid input'}
}
export default function TextToBinaryPage() {
  const [input,setInput]=useState('Hello')
  const [mode,setMode]=useState<Mode>('binary')
  const [direction,setDirection]=useState<'encode'|'decode'>('encode')
  const output=direction==='encode'?textToMode(input,mode):modeToText(input,mode)
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const MODES:Mode[]=['binary','hex','octal','decimal']
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {MODES.map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${mode===m?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
              {m.charAt(0).toUpperCase()+m.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['encode','decode'] as const).map(d=>(
            <button key={d} onClick={()=>setDirection(d)}
              className={`flex-1 py-2 text-sm font-medium transition ${direction===d?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>
              {d==='encode'?'Text → '+mode.charAt(0).toUpperCase()+mode.slice(1):mode.charAt(0).toUpperCase()+mode.slice(1)+' → Text'}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Output</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
          <textarea readOnly value={output} rows={4}
            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none break-all"/>
        </div>
      </div>
    </ToolLayout>
  )
}