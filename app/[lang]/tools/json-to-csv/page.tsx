'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-to-csv')!
function jsonToCsv(jsonStr:string,delimiter:string):string{
  try{
    let data=JSON.parse(jsonStr)
    if(!Array.isArray(data))data=[data]
    if(data.length===0)return ''
    const headers=Array.from(new Set(data.flatMap((row:any)=>Object.keys(row))))
    const escape=(v:any)=>{
      const s=v===null||v===undefined?'':typeof v==='object'?JSON.stringify(v):String(v)
      return s.includes(delimiter)||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s\n    }
    const rows=[headers.join(delimiter),...data.map((row:any)=>headers.map((h:string)=>escape(row[h])).join(delimiter))]
    return rows.join('\n')\n  }catch(e){return 'Error: '+String(e)}\n}\nconst SAMPLE=JSON.stringify([{name:'Alice',age:30,city:'New York',email:'alice@example.com'},{name:'Bob',age:25,city:'London',email:'bob@example.com'},{name:'Carol',age:35,city:'Tokyo',email:'carol@example.com'}],null,2)\nexport default function JsonToCsvPage() {\n  const [input,setInput]=useState(SAMPLE)\n  const [delimiter,setDelimiter]=useState(',')\n  const [copied,setCopied]=useState(false)\n  const csv=jsonToCsv(input,delimiter)\n  const isError=csv.startsWith('Error:')\n  const download=()=>{\n    const blob=new Blob([csv],{type:'text/csv'})\n    const url=URL.createObjectURL(blob)\n    const a=document.createElement('a');a.href=url;a.download='data.csv';a.click()\n    URL.revokeObjectURL(url)\n  }\n  const copy=()=>{navigator.clipboard.writeText(csv);setCopied(true);setTimeout(()=>setCopied(false),1500)}\n  const lineCount=csv.split('
').filter(Boolean).length\n  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Delimiter:</span>
            {[{l:'Comma',v:','},{l:'Semicolon',v:';'},{l:'Tab',v:'	'},{l:'Pipe',v:'|'}].map(d=>(
              <button key={d.l} onClick={()=>setDelimiter(d.v)}
                className={'px-3 py-1.5 text-xs rounded border transition '+(delimiter===d.v?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>
                {d.l}
              </button>
            ))}
          </div>
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">JSON input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"
            placeholder='[{"name":"Alice","age":30}]'/></div>
        {!isError&&<div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{lineCount} rows</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={copy} className="px-3 py-1.5 rounded border border-gray-300 text-xs hover:bg-gray-50">{copied?'Copied!':'Copy'}</button>
            <button onClick={download} className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700">Download CSV</button>
          </div>
        </div>}
        <div className={'rounded-xl overflow-hidden '+(isError?'bg-red-50 border border-red-200':'bg-gray-900')}>
          <pre className={'px-4 py-4 font-mono text-xs overflow-x-auto max-h-48 '+(isError?'text-red-700':'text-green-400')}>{csv||'No output'}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}