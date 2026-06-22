'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('markdown-table-generator')!
export default function MarkdownTableGeneratorPage() {
  const [rows,setRows]=useState(3)
  const [cols,setCols]=useState(3)
  const [headers,setHeaders]=useState<string[]>(['Name','Value','Description'])
  const [data,setData]=useState<string[][]>([['Item 1','100','First item'],['Item 2','200','Second item'],['Item 3','300','Third item']])
  const [aligns,setAligns]=useState<('left'|'center'|'right')[]>(['left','center','left'])
  const [copied,setCopied]=useState(false)
  const setHeader=(i:number,v:string)=>{const h=[...headers];h[i]=v;setHeaders(h)}
  const setCell=(r:number,c:number,v:string)=>{const d=data.map(row=>[...row]);d[r][c]=v;setData(d)}
  const setAlign=(i:number,a:'left'|'center'|'right')=>{const al=[...aligns];al[i]=a;setAligns(al)}
  const addRow=()=>{setRows(r=>r+1);setData(d=>[...d,Array(cols).fill('')])}
  const addCol=()=>{setCols(c=>c+1);setHeaders(h=>[...h,'Header']);setAligns(a=>[...a,'left']);setData(d=>d.map(r=>[...r,'']))}
  const remRow=()=>{if(rows>1){setRows(r=>r-1);setData(d=>d.slice(0,-1))}}
  const remCol=()=>{if(cols>1){setCols(c=>c-1);setHeaders(h=>h.slice(0,-1));setAligns(a=>a.slice(0,-1));setData(d=>d.map(r=>r.slice(0,-1)))}}
  const alignChar=(a:string)=>a==='center'?':---:':a==='right'?'---:':'---'
  const pad=(s:string,l:number)=>s+('' ).repeat(Math.max(0,l-s.length))
  const colWidths=Array.from({length:cols},(_,c)=>Math.max(headers[c]?.length||0,...data.map(r=>r[c]?.length||0),3))
  const md=[
    '| '+headers.map((h,i)=>pad(h||'',colWidths[i])).join(' | ')+' |',
    '| '+aligns.map((a,i)=>pad(alignChar(a),colWidths[i])).join(' | ')+' |',
    ...data.map(r=>'| '+r.map((c,i)=>pad(c||'',colWidths[i])).join(' | ')+' |'),
  ].join('\n')
  const copy=()=>{navigator.clipboard.writeText(md);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const ABtn=({col,a}:{col:number;a:'left'|'center'|'right'})=>(
    <button onClick={()=>setAlign(col,a)} className={`px-1.5 py-0.5 rounded text-xs ${aligns[col]===a?'bg-blue-600 text-white':'text-gray-400 hover:text-gray-600'}`}>
      {a==='left'?'⬅':a==='center'?'⬛':'➡'}
    </button>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button onClick={addRow} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">+ Row</button>
          <button onClick={remRow} className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-40" disabled={rows<=1}>- Row</button>
          <button onClick={addCol} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">+ Col</button>
          <button onClick={remCol} className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-40" disabled={cols<=1}>- Col</button>
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-sm">
            <thead><tr>
              {headers.map((h,i)=>(
                <th key={i} className="border border-gray-300 bg-blue-50 p-1">
                  <input value={h} onChange={e=>setHeader(i,e.target.value)} className="w-full bg-transparent text-center font-semibold outline-none min-w-16"/>
                  <div className="flex justify-center gap-0.5 mt-1">
                    <ABtn col={i} a="left"/><ABtn col={i} a="center"/><ABtn col={i} a="right"/>
                  </div>
                </th>
              ))}
            </tr></thead>
            <tbody>
              {data.map((row,ri)=>(
                <tr key={ri}>{row.map((cell,ci)=>(
                  <td key={ci} className="border border-gray-300 p-1">
                    <input value={cell} onChange={e=>setCell(ri,ci,e.target.value)} className="w-full outline-none text-center min-w-16"/>
                  </td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <pre className="text-green-400 text-sm font-mono flex-1 overflow-x-auto">{md}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}