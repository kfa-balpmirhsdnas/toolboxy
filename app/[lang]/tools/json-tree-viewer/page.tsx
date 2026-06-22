'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-tree-viewer')!
const SAMPLE='{"user":{"name":"Alice","age":30,"roles":["admin","editor"],"address":{"city":"New York","zip":"10001"}},"settings":{"theme":"dark","notifications":true,"language":"en"},"metadata":{"created":"2024-01-01","version":2}}'
function TreeNode({data,depth=0,label}:{data:unknown;depth?:number;label?:string}) {
  const [open,setOpen]=useState(depth<2)
  const isObj=typeof data==='object'&&data!==null&&!Array.isArray(data)
  const isArr=Array.isArray(data)
  const isPrim=!isObj&&!isArr
  const cnt=isObj?Object.keys(data).length:isArr?data.length:0
  const typeColor=(v:unknown)=>{if(v===null)return'text-gray-400';if(typeof v==='boolean')return'text-blue-500';if(typeof v==='number')return'text-amber-600';return'text-green-600'}
  if(isPrim)return(
    <div className="flex items-center gap-1 py-0.5">
      {label!==undefined&&<span className="text-purple-600 font-medium text-xs">"{label}": </span>}
      <span className={'text-xs font-mono '+(typeColor(data))}>{data===null?'null':typeof data==='string'?'"'+data+'"':String(data)}</span>
    </div>
  )
  return(
    <div>
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-1 py-0.5 hover:bg-gray-100 rounded px-1 -ml-1 w-full text-left">
        <span className="text-gray-400 text-xs w-3">{open?'▾':'▸'}</span>
        {label!==undefined&&<span className="text-purple-600 font-medium text-xs">"{label}": </span>}
        <span className="text-gray-500 text-xs">{isArr?'[':'{'}</span>
        {!open&&<span className="text-gray-400 text-xs ml-1">{cnt} {isArr?'items':'keys'}</span>}
        {!open&&<span className="text-gray-500 text-xs">{isArr?']':'}'}</span>}
      </button>
      {open&&(
        <div className="ml-4 border-l border-gray-200 pl-3">
          {isArr?(data as unknown[]).map((v,i)=><TreeNode key={i} data={v} depth={depth+1} label={String(i)}/>)
            :Object.entries(data as Record<string,unknown>).map(([k,v])=><TreeNode key={k} data={v} depth={depth+1} label={k}/>)}
          <div className="text-gray-500 text-xs py-0.5">{isArr?']':'}'}</div>
        </div>
      )}
    </div>
  )
}
export default function JsonTreeViewerPage() {
  const [input,setInput]=useState(SAMPLE)
  const [error,setError]=useState('')
  const [parsed,setParsed]=useState<unknown>(null)
  const [tab,setTab]=useState<'input'|'tree'>('tree')
  const parse=(val:string)=>{
    try{const p=JSON.parse(val);setParsed(p);setError('');return true}
    catch(e){setError(String(e));setParsed(null);return false}
  }
  const onInput=(v:string)=>{setInput(v);parse(v)}
  useState(()=>{parse(SAMPLE)})
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setTab('input')} className={'flex-1 py-2 text-sm font-medium transition '+(tab==='input'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>JSON Input</button>
          <button onClick={()=>setTab('tree')} className={'flex-1 py-2 text-sm font-medium transition '+(tab==='tree'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Tree View</button>
        </div>
        {tab==='input'?(
          <div>
            <textarea value={input} onChange={e=>onInput(e.target.value)} rows={12}
              className={'w-full rounded-xl border px-3 py-2.5 font-mono text-sm resize-none focus:outline-none '+(error?'border-red-300 bg-red-50':'border-gray-300 focus:border-blue-400')}
              placeholder='{"key": "value"}'/>
            {error&&<p className="text-red-500 text-xs mt-1">{error}</p>}
            {parsed!==null&&<p className="text-green-600 text-xs mt-1">Valid JSON</p>}
          </div>
        ):(
          <div className="bg-gray-50 rounded-xl p-4 min-h-48 font-mono text-sm overflow-auto max-h-96">
            {parsed!==null?<TreeNode data={parsed} depth={0}/>:<div className="text-gray-400 text-sm">{error||'Enter valid JSON in the Input tab'}</div>}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}