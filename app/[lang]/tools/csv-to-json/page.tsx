'use client'
import { useState } from 'react'

function csvToJson(csv:string,delimiter:string):{json:string;error:string;rows:number}{
  try{
    const lines=csv.trim().split('\n').filter(l=>l.trim())
    if(lines.length<2) return{json:'',error:'Need at least a header row and one data row',rows:0}
    const headers=lines[0].split(delimiter).map(h=>h.trim().replace(/^"|"$/g,''))
    const rows=lines.slice(1).map(line=>{
      const values:string[]=[]
      let cur='',inQuote=false
      for(const ch of line){
        if(ch==='"') inQuote=!inQuote
        else if(ch===delimiter&&!inQuote){values.push(cur.trim());cur=''}
        else cur+=ch
      }
      values.push(cur.trim())
      const obj:Record<string,string|number>={}
      headers.forEach((h,i)=>{
        const v=(values[i]||'').replace(/^"|"$/g,'')
        obj[h]=isNaN(Number(v))||v===''?v:Number(v)
      })
      return obj
    })
    return{json:JSON.stringify(rows,null,2),error:'',rows:rows.length}
  }catch(e){return{json:'',error:String(e),rows:0}}
}

const SAMPLE=`name,age,city,score
Alice,30,New York,95.5
Bob,25,London,87
Charlie,35,Tokyo,92.3`

export default function CsvToJsonPage() {
  const [input,setInput]=useState(SAMPLE)
  const [delimiter,setDelimiter]=useState(',')
  const [copied,setCopied]=useState(false)

  const {json,error,rows}=csvToJson(input,delimiter)

  function copy(){navigator.clipboard.writeText(json);setCopied(true);setTimeout(()=>setCopied(false),2000)}
  function download(){
    const blob=new Blob([json],{type:'application/json'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='data.json';a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV to JSON Converter</h1>
        <p className="text-gray-500 mb-6">Convert CSV data to JSON format with automatic type detection</p>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Delimiter:</span>
          {[',','\t',';','|'].map(d=>(
            <button key={d} onClick={()=>setDelimiter(d)} className={'px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-colors '+(delimiter===d?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
              {d==='\t'?'Tab':d}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">CSV Input</span>
              <button onClick={()=>setInput(SAMPLE)} className="text-xs text-brand-600 hover:underline">Example</button>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={16}
              className="w-full p-4 font-mono text-sm focus:outline-none resize-none" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">JSON Output {rows>0&&`(${rows} rows)`}</span>
              {json&&(
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">{copied?'\u2713':'Copy'}</button>
                  <button onClick={download} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">Download</button>
                </div>
              )}
            </div>
            {error?(
              <div className="p-4 text-red-500 text-sm">{error}</div>
            ):(
              <pre className="p-4 font-mono text-xs text-gray-700 overflow-auto h-[400px] whitespace-pre">{json||'Output appears here...'}</pre>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}