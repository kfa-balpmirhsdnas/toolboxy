'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-minifier')!
export default function JsonMinifierPage() {
  const [input,setInput]=useState('{\n  "name": "Alice",
  "age": 30,
  "city": "New York"
}')\n  const [indent,setIndent]=useState(2)
  const [mode,setMode]=useState<'minify'|'pretty'>('minify')
  const [sortKeys,setSortKeys]=useState(false)
  const [copied,setCopied]=useState(false)
  const process=():string=>{
    try{
      const parsed=JSON.parse(input)
      const replacer=sortKeys?((_:string,v:unknown)=>
        v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v as Record<string,unknown>).sort().reduce((r:Record<string,unknown>,k)=>{r[k]=(v as Record<string,unknown>)[k];return r},{}) as unknown:v):null
      return mode==='minify'?JSON.stringify(parsed,replacer):JSON.stringify(parsed,replacer,indent)
    }catch(e:unknown){return 'Error: '+(e instanceof Error?e.message:String(e))}
  }
  const output=process()
  const isError=output.startsWith('Error:')
  const inSize=new Blob([input]).size
  const outSize=new Blob([output]).size
  const savings=inSize>0?((1-outSize/inSize)*100).toFixed(1):'0'
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex rounded overflow-hidden border border-gray-300">
            <button onClick={()=>setMode('minify')} className={'px-3 py-1.5 text-sm font-medium transition '+(mode==='minify'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Minify</button>
            <button onClick={()=>setMode('pretty')} className={'px-3 py-1.5 text-sm font-medium transition '+(mode==='pretty'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Prettify</button>
          </div>
          {mode==='pretty'&&(
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Indent:</span>
              {[2,4].map(n=>(
                <button key={n} onClick={()=>setIndent(n)}
                  className={'w-9 h-8 rounded border font-mono text-sm transition '+(indent===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{n}</button>
              ))}
              <button onClick={()=>setIndent(-1)}
                className={'px-2 h-8 rounded border text-xs transition '+(indent===-1?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>Tab</button>
            </div>
          )}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-auto">
            <input type="checkbox" checked={sortKeys} onChange={e=>setSortKeys(e.target.checked)} className="rounded"/>Sort keys
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Input JSON</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/>
            <p className="text-xs text-gray-400 mt-0.5">{inSize} bytes</p></div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Output</label>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={10} className={'w-full rounded border px-3 py-2 font-mono text-xs resize-none '+(isError?'border-red-200 bg-red-50 text-red-700':'border-gray-200 bg-gray-50')}/>
            {!isError&&<p className="text-xs text-gray-400 mt-0.5">{outSize} bytes{mode==='minify'&&' (saved '+savings+'%)'}</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}