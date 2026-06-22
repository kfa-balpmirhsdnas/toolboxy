'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('uuid-bulk-generator')!
function genUUID():string{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
    const r=Math.random()*16|0
    return (c==='x'?r:(r&0x3|0x8)).toString(16)
  })
}
export default function UuidBulkGeneratorPage() {
  const [count,setCount]=useState(10)
  const [uuids,setUuids]=useState<string[]>(()=>Array.from({length:10},genUUID))
  const [format,setFormat]=useState<'default'|'upper'|'no-dash'|'braces'>('default')
  const [copied,setCopied]=useState(false)
  const fmt=(u:string)=>{
    if(format==='upper')return u.toUpperCase()
    if(format==='no-dash')return u.replace(/-/g,'')
    if(format==='braces')return '{'+u+'}'
    return u
  }
  const generate=()=>setUuids(Array.from({length:Math.min(count,1000)},genUUID))
  const copyAll=()=>{navigator.clipboard.writeText(uuids.map(fmt).join('\n'));setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const FORMATS=[{id:'default',label:'Default'},{id:'upper',label:'UPPERCASE'},{id:'no-dash',label:'No dashes'},{id:'braces',label:'{Braces}'}]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Count: {count}</label>
            <input type="range" min="1" max="100" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full"/>
            <input type="number" min="1" max="1000" value={count} onChange={e=>setCount(Math.min(1000,Math.max(1,Number(e.target.value))))} className="w-full mt-1 rounded border border-gray-300 px-2 py-1 text-center text-sm"/>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <div className="grid grid-cols-2 gap-1">
              {FORMATS.map(f=>(
                <button key={f.id} onClick={()=>setFormat(f.id as typeof format)}
                  className={`py-1.5 rounded border text-xs font-medium transition ${format===f.id?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">Generate {count} UUIDs</button>
          <button onClick={copyAll} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">{copied?'Copied!':'Copy All'}</button>
        </div>
        <div className="max-h-80 overflow-y-auto space-y-1">
          {uuids.map((u,i)=>(
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded hover:bg-gray-100 group">
              <span className="text-xs text-gray-400 w-5 text-right">{i+1}</span>
              <span className="font-mono text-xs text-gray-700 flex-1 select-all">{fmt(u)}</span>
              <button onClick={()=>navigator.clipboard.writeText(fmt(u))} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100">Copy</button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}