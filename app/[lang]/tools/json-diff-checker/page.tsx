'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-diff-checker')!
type DiffLine={type:'same'|'added'|'removed'|'changed';key:string;left:unknown;right:unknown;path:string}
function flattenObj(obj:unknown,prefix=''):Record<string,unknown>{
  if(typeof obj!=='object'||obj===null)return {[prefix]:obj}
  const result:Record<string,unknown>={}
  Object.entries(obj as Record<string,unknown>).forEach(([k,v])=>{
    const path=prefix?prefix+'.'+k:k
    if(typeof v==='object'&&v!==null&&!Array.isArray(v)){Object.assign(result,flattenObj(v,path))}
    else{result[path]=v}
  })
  return result
}
function diff(a:string,b:string):DiffLine[]{
  const objA=JSON.parse(a),objB=JSON.parse(b)
  const flatA=flattenObj(objA),flatB=flattenObj(objB)
  const keys=new Set([...Object.keys(flatA),...Object.keys(flatB)])
  return [...keys].sort().map(k=>{
    const inA=k in flatA,inB=k in flatB
    if(inA&&!inB)return {type:'removed',key:k,left:flatA[k],right:undefined,path:k}
    if(!inA&&inB)return {type:'added',key:k,left:undefined,right:flatB[k],path:k}
    if(JSON.stringify(flatA[k])!==JSON.stringify(flatB[k]))return {type:'changed',key:k,left:flatA[k],right:flatB[k],path:k}
    return {type:'same',key:k,left:flatA[k],right:flatA[k],path:k}
  })
}
export default function JsonDiffCheckerPage() {
  const [left,setLeft]=useState('{"name":"John","age":30,"city":"New York","active":true}')
  const [right,setRight]=useState('{"name":"Jane","age":25,"city":"New York","country":"USA"}')
  const [result,setResult]=useState<DiffLine[]|null>(null)
  const [err,setErr]=useState('')
  const [showSame,setShowSame]=useState(false)
  const check=()=>{try{setResult(diff(left,right));setErr('')}catch(e){setErr((e as Error).message);setResult(null)}}
  const COL:Record<string,string>={added:'bg-green-50 border-l-4 border-green-400',removed:'bg-red-50 border-l-4 border-red-400',changed:'bg-amber-50 border-l-4 border-amber-400',same:'bg-gray-50'}
  const BADGE:Record<string,string>={added:'bg-green-100 text-green-700',removed:'bg-red-100 text-red-700',changed:'bg-amber-100 text-amber-700',same:'bg-gray-100 text-gray-500'}
  const filtered=result?.filter(r=>showSame||r.type!=='same')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">JSON A (original)</label>
            <textarea value={left} onChange={e=>setLeft(e.target.value)} rows={6} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">JSON B (modified)</label>
            <textarea value={right} onChange={e=>setRight(e.target.value)} rows={6} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/></div>
        </div>
        {err&&<p className="text-red-500 text-sm">{err}</p>}
        <div className="flex gap-3 items-center">
          <button onClick={check} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">Compare JSON</button>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showSame} onChange={e=>setShowSame(e.target.checked)} className="rounded"/>Show unchanged
          </label>
        </div>
        {result&&(
          <div>
            <div className="flex gap-3 text-sm mb-3">
              {['added','removed','changed','same'].map(t=>(
                <span key={t} className={'px-2 py-0.5 rounded text-xs font-medium '+BADGE[t]}>
                  {result.filter(r=>r.type===t).length} {t}
                </span>
              ))}
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filtered?.map(r=>(
                <div key={r.path} className={'rounded px-3 py-2 '+COL[r.type]}>
                  <div className="flex items-start gap-2">
                    <span className={'text-xs font-medium px-1.5 py-0.5 rounded shrink-0 '+BADGE[r.type]}>{r.type}</span>
                    <span className="font-mono text-xs text-gray-700 font-semibold">{r.path}</span>
                  </div>
                  {r.type==='changed'&&<div className="mt-1 font-mono text-xs ml-12">
                    <span className="text-red-600">- {JSON.stringify(r.left)}</span><br/>
                    <span className="text-green-600">+ {JSON.stringify(r.right)}</span>
                  </div>}
                  {r.type!=='changed'&&r.type!=='same'&&<p className="mt-0.5 font-mono text-xs ml-12 text-gray-600">{JSON.stringify(r.left??r.right)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}