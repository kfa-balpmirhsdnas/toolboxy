'use client'
import { useState } from 'react'

const SAMPLE='{"name":"Alice","age":30,"address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","hiking"]}'

export default function JsonFormatterPage() {
  const [input,setInput]=useState(SAMPLE)
  const [indent,setIndent]=useState(2)
  const [sortKeys,setSortKeys]=useState(false)
  const [copied,setCopied]=useState(false)

  let output='',error=''
  try{
    const parsed=JSON.parse(input)
    function sortObj(obj:unknown):unknown{
      if(Array.isArray(obj)) return obj.map(sortObj)
      if(obj!==null&&typeof obj==='object'){
        const sorted:Record<string,unknown>={}
        Object.keys(obj as object).sort().forEach(k=>{sorted[k]=sortObj((obj as Record<string,unknown>)[k])})
        return sorted
      }
      return obj
    }
    output=JSON.stringify(sortKeys?sortObj(parsed):parsed,null,indent)
  }catch(e){error=String(e)}

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  function minify(){try{setInput(JSON.stringify(JSON.parse(input)))}catch{}}

  const lines=output.split('\n').length
  const size=new TextEncoder().encode(output).length

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JSON Formatter</h1>
        <p className="text-gray-500 mb-6">Format, validate, and minify JSON data</p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">Indent:</span>
            {[2,4,8,'\t'].map(n=>(
              <button key={n} onClick={()=>setIndent(n===('\t' as unknown)?'\t' as unknown as number:n as number)}
                className={'px-2.5 py-1 rounded-lg font-mono text-xs font-bold '+(indent===n?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
                {n===('\t' as unknown)?'Tab':n}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={sortKeys} onChange={e=>setSortKeys(e.target.checked)} className="rounded" />
            Sort keys
          </label>
          <button onClick={minify} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Minify</button>
          {output&&<button onClick={copy} className="px-3 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg">{copied?'\u2713':'Copy'}</button>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Input</span>
              <button onClick={()=>setInput(SAMPLE)} className="text-xs text-brand-600 hover:underline">Example</button>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={20}
              className="w-full p-4 font-mono text-xs focus:outline-none resize-none" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Formatted</span>
              {!error&&output&&<span className="text-xs text-gray-400">{lines} lines · {size} bytes</span>}
            </div>
            {error?(
              <div className="p-4"><p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p></div>
            ):(
              <pre className="p-4 font-mono text-xs text-gray-700 overflow-auto h-[480px] whitespace-pre">{output}</pre>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}