'use client'
import { useState, useMemo, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('csv-viewer')!
function parseCsv(text:string,sep:string):{headers:string[];rows:string[][]}{
  const lines=text.trim().split('
').filter(l=>l.trim())
  if(lines.length===0)return{headers:[],rows:[]}
  const splitLine=(l:string)=>{
    const result:string[]=[],re=new RegExp('(?:^|'+sep+')(?:"([^"]*(?:""[^"]*)*)"|([^"'+sep+']*))', 'g')
    let m;while((m=re.exec(l))!==null)result.push((m[1]||m[2]||'').replace(/""/g,'"'))
    return result
  }
  const headers=splitLine(lines[0])
  const rows=lines.slice(1).map(splitLine)
  return{headers,rows}
}
const SAMPLE='Name,Age,City,Score
Alice,30,New York,95
Bob,25,London,87
Carol,35,Tokyo,92
Dave,28,Paris,78
Eve,32,Sydney,89'
export default function CsvViewerPage() {
  const [csv,setCsv]=useState(SAMPLE)
  const [sep,setSep]=useState(',')
  const [sortCol,setSortCol]=useState(-1)
  const [sortDir,setSortDir]=useState<1|-1>(1)
  const [filter,setFilter]=useState('')
  const [copied,setCopied]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const {headers,rows}=useMemo(()=>parseCsv(csv,sep),[csv,sep])
  const filtered=useMemo(()=>filter?rows.filter(r=>r.some(c=>c.toLowerCase().includes(filter.toLowerCase()))):rows,[rows,filter])
  const sorted=useMemo(()=>{if(sortCol<0)return filtered;return [...filtered].sort((a,b)=>{const va=a[sortCol]||'',vb=b[sortCol]||'';const na=parseFloat(va),nb=parseFloat(vb);if(!isNaN(na)&&!isNaN(nb))return(na-nb)*sortDir;return va.localeCompare(vb)*sortDir})},[filtered,sortCol,sortDir])
  const toggleSort=(i:number)=>{if(sortCol===i)setSortDir(d=>d===-1?1:-1);else{setSortCol(i);setSortDir(1)}}
  const onFile=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCsv(ev.target?.result as string);r.readAsText(f)}
  const copy=()=>{navigator.clipboard.writeText(csv);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={onFile}/>
          <button onClick={()=>fileRef.current?.click()} className="text-sm px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Upload CSV</button>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-600">Separator:</label>
            <select value={sep} onChange={e=>setSep(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
              <option value=",">Comma (,)</option><option value=";">Semicolon (;)</option><option value="	">Tab</option><option value="|">Pipe (|)</option>
            </select>
          </div>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter rows..." className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 min-w-24"/>
          <span className="text-xs text-gray-500">{sorted.length}/{rows.length} rows · {headers.length} cols</span>
        </div>
        <div className="overflow-auto max-h-72 rounded-xl border border-gray-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 sticky top-0">
                <th className="px-2 py-2 text-center text-xs text-gray-400 w-10">#</th>
                {headers.map((h,i)=>(
                  <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none border-b border-gray-200"
                    onClick={()=>toggleSort(i)}>
                    {h} {sortCol===i?(sortDir===1?'▲':'▼'):''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row,ri)=>(
                <tr key={ri} className={ri%2===0?'bg-white':'bg-gray-50/50 hover:bg-blue-50/30 transition'}>
                  <td className="px-2 py-1.5 text-xs text-gray-400 text-center">{ri+1}</td>
                  {headers.map((_,ci)=><td key={ci} className="px-3 py-1.5 text-xs text-gray-800 border-b border-gray-100 max-w-32 truncate">{row[ci]||''}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Raw CSV</label>
          <div className="flex gap-2">
            <textarea value={csv} onChange={e=>setCsv(e.target.value)} rows={3}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/>
            <button onClick={copy} className="px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm">{copied?'✓':'Copy'}</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}