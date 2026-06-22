'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-to-csv')!
function jsonToCsv(json:string):string{
  let data:unknown[]
  try{data=JSON.parse(json)}catch{throw new Error('Invalid JSON')}
  if(!Array.isArray(data))throw new Error('JSON must be an array of objects')
  if(data.length===0)return ''
  const keys=Array.from(new Set(data.flatMap(r=>Object.keys(r as object))))
  const escape=(v:unknown)=>{
    const s=v===null||v===undefined?'':typeof v==='object'?JSON.stringify(v):String(v)
    return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s
  }
  const rows=[keys.join(','),...data.map(r=>keys.map(k=>escape((r as Record<string,unknown>)[k])).join(','))]
  return rows.join('\n')
}
export default function JsonToCsvPage() {
  const [input,setInput]=useState('[{"name":"Alice","age":30,"city":"NY"},{"name":"Bob","age":25,"city":"LA"}]')
  const [output,setOutput]=useState('')
  const [err,setErr]=useState('')
  const [copied,setCopied]=useState(false)
  const convert=()=>{
    setErr('')
    try{setOutput(jsonToCsv(input))}
    catch(e){setErr((e as Error).message)}
  }
  const download=()=>{
    const blob=new Blob([output],{type:'text/csv'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='data.csv';a.click()
    URL.revokeObjectURL(url)
  }
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">JSON Input (array of objects)</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={7}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/>
        </div>
        <button onClick={convert} className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">Convert to CSV</button>
        {err&&<p className="text-red-500 text-sm bg-red-50 rounded p-2">{err}</p>}
        {output&&(
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">CSV Output</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
                <button onClick={download} className="text-xs text-green-600 hover:underline">Download .csv</button>
              </div>
            </div>
            <textarea readOnly value={output} rows={7}
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}