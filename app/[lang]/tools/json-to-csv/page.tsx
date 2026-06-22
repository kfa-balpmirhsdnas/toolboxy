'use client'
import { useState } from 'react'

function jsonToCsv(json:string):{csv:string;error:string}{
  try{
    const data=JSON.parse(json)
    const arr=Array.isArray(data)?data:[data]
    if(arr.length===0) return{csv:'',error:'Empty array'}
    const keys=Object.keys(arr[0])
    const header=keys.map(k=>'"'+k.replace(/"/g,'""')+'"').join(',')
    const rows=arr.map(row=>keys.map(k=>{
      const v=row[k]
      if(v===null||v===undefined) return ''
      const s=typeof v==='object'?JSON.stringify(v):String(v)
      return '"'+s.replace(/"/g,'""')+'"'
    }).join(','))
    return{csv:[header,...rows].join('\n'),error:''}
  }catch(e){return{csv:'',error:String(e)}}
}

const SAMPLE=`[
  {"name": "Alice", "age": 30, "city": "New York"},
  {"name": "Bob", "age": 25, "city": "London"},
  {"name": "Charlie", "age": 35, "city": "Tokyo"}
]`

export default function JsonToCsvPage() {
  const [input,setInput]=useState(SAMPLE)
  const [copied,setCopied]=useState(false)

  const {csv,error}=jsonToCsv(input)

  function copy(){navigator.clipboard.writeText(csv);setCopied(true);setTimeout(()=>setCopied(false),2000)}
  function download(){
    const blob=new Blob([csv],{type:'text/csv'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='converted.csv';a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JSON to CSV Converter</h1>
        <p className="text-gray-500 mb-6">Convert JSON arrays to CSV format — paste your data and download or copy</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">JSON Input</span>
              <button onClick={()=>setInput(SAMPLE)} className="text-xs text-brand-600 hover:underline">Load example</button>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={18}
              className="w-full p-4 font-mono text-sm focus:outline-none resize-none" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">CSV Output</span>
              {csv&&(
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">{copied?'\u2713':'Copy'}</button>
                  <button onClick={download} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">Download</button>
                </div>
              )}
            </div>
            {error?(
              <div className="p-4 text-red-500 text-sm">{error}</div>
            ):(
              <pre className="p-4 font-mono text-xs text-gray-700 overflow-auto h-[440px] whitespace-pre">{csv||'Output appears here...'}</pre>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}