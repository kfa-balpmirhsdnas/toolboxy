'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-to-typescript')!
function jsonTypeOf(val:unknown):string{
  if(val===null)return 'null'
  if(Array.isArray(val)){
    if(val.length===0)return 'unknown[]'
    const types=[...new Set(val.map(v=>jsonTypeOf(v)))]
    return types.length===1?types[0]+'[]':('('+types.join('|')+')[]')
  }
  if(typeof val==='object'){return generateInterface(val as Record<string,unknown>)}
  return typeof val
}
function generateInterface(obj:Record<string,unknown>,indent=0):string{
  const sp='  '.repeat(indent)
  const isp='  '.repeat(indent+1)
  const lines=Object.entries(obj).map(([k,v])=>{
    const safeKey=/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)?k:`'${k}'`
    return `${isp}${safeKey}: ${jsonTypeOf(v)};`
  })
  return '{\n'+lines.join('
')+'
'+sp+'}'\n}
function convert(json:string,name:string):string{
  const obj=JSON.parse(json)
  if(Array.isArray(obj)){
    const inner=obj.length>0&&typeof obj[0]==='object'&&!Array.isArray(obj[0])?generateInterface(obj[0] as Record<string,unknown>):'unknown'
    return `export type ${name} = ${inner}[];`
  }
  if(typeof obj==='object'&&obj!==null){
    return `export interface ${name} ${generateInterface(obj as Record<string,unknown>)}`
  }
  return `export type ${name} = ${typeof obj};`
}
export default function JsonToTypescriptPage() {
  const [input,setInput]=useState('{"name":"John","age":30,"email":"john@example.com","scores":[95,87,92],"address":{"city":"New York","country":"USA"},"active":true}')
  const [name,setName]=useState('MyType')
  const [output,setOutput]=useState('')
  const [err,setErr]=useState('')
  const [copied,setCopied]=useState(false)
  const convert2=()=>{
    try{setOutput(convert(input,name));setErr('')}catch(e){setErr((e as Error).message);setOutput('')}
  }
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Interface/Type name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">JSON Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={12} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/></div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">TypeScript Output</label>
              {output&&<button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>}
            </div>
            <textarea readOnly value={output} rows={12} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          </div>
        </div>
        {err&&<p className="text-red-500 text-sm">{err}</p>}
        <button onClick={convert2} className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">Convert to TypeScript</button>
      </div>
    </ToolLayout>
  )
}