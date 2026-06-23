'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [input,setInput]=useState('{"name":"Alice","age":30,"hobbies":["reading","coding"],"address":{"city":"New York","zip":"10001"}}')
  const [indent,setIndent]=useState(2)
  const [mode,setMode]=useState('minify')
  let output='',error=''
  try{
    const parsed=JSON.parse(input)
    if(mode==='minify')output=JSON.stringify(parsed)
    else output=JSON.stringify(parsed,null,indent)
  }catch(e:unknown){error=e instanceof Error?e.message:'Invalid JSON'}
  const pct=output&&input.length>0?Math.round((1-output.length/input.length)*100):0
  const tool=TOOLS.find(t=>t.slug==='json-minifier')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-2">
          {[['minify','Minify'],['format','Format/Prettify']].map(([m,lbl])=>(
            <button key={m} onClick={()=>setMode(m)} className={'px-4 py-2 rounded text-sm font-medium border '+(mode===m?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{lbl}</button>
          ))}
          {mode==='format'&&<label className="flex items-center gap-2 text-sm text-gray-700 ml-2">Indent
            <select value={indent} onChange={e=>setIndent(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm">
              {[2,4,8].map(n=><option key={n} value={n}>{n} spaces</option>)}
            </select></label>}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">JSON Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={7} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        {error&&<p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{error}</p>}
        {!error&&output&&<>
          <div className="flex justify-between text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
            <span>{input.length} → {output.length} chars</span>
            {mode==='minify'&&<span className="text-green-600 font-semibold">{pct}% saved</span>}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
            <textarea value={output} readOnly rows={7} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
          <button onClick={()=>navigator.clipboard?.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
        </>}
      </div>
    </ToolLayout>
  )
}