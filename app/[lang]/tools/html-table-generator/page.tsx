'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-table-generator')!
export default function HtmlTableGeneratorPage() {
  const [rows,setRows]=useState(3)
  const [cols,setCols]=useState(3)
  const [headers,setHeaders]=useState<string[]>(['Column 1','Column 2','Column 3'])
  const [cells,setCells]=useState<string[][]>([['Cell 1,1','Cell 1,2','Cell 1,3'],['Cell 2,1','Cell 2,2','Cell 2,3'],['Cell 3,1','Cell 3,2','Cell 3,3']])
  const [bordered,setBordered]=useState(true)
  const [striped,setStriped]=useState(true)
  const [hoverable,setHoverable]=useState(false)
  const [copied,setCopied]=useState(false)
  const setRows2=(n:number)=>{
    const nr=Math.max(1,Math.min(20,n))
    setRows(nr)
    setCells(c=>{const nc=[...c];while(nc.length<nr)nc.push(Array(cols).fill(''));while(nc.length>nr)nc.pop();return nc})
  }
  const setCols2=(n:number)=>{
    const nc=Math.max(1,Math.min(10,n))
    setCols(nc)
    setHeaders(h=>{const nh=[...h];while(nh.length<nc)nh.push('Column '+(nh.length+1));while(nh.length>nc)nh.pop();return nh})
    setCells(c=>c.map(r=>{const nr=[...r];while(nr.length<nc)nr.push('');while(nr.length>nc)nr.pop();return nr}))
  }
  const updateHeader=(i:number,v:string)=>setHeaders(h=>h.map((x,idx)=>idx===i?v:x))
  const updateCell=(r:number,c:number,v:string)=>setCells(cs=>cs.map((row,ri)=>ri===r?row.map((cell,ci)=>ci===c?v:cell):row))
  const borderStyle=bordered?'border:1px solid #d1d5db;':''
  const html='<table style="border-collapse:collapse;width:100%">
  <thead>
    <tr>
'+headers.map(h=>'      <th style="'+borderStyle+'padding:8px 12px;background:#f9fafb;font-weight:600;text-align:left">'+h+'</th>').join('
')+'
    </tr>
  </thead>
  <tbody>
'+cells.map((row,ri)=>'    <tr'+(striped&&ri%2===1?' style="background:#f9fafb"':'')+'>
'+row.map(c=>'      <td style="'+borderStyle+'padding:8px 12px">'+c+'</td>').join('
')+'
    </tr>').join('
')+'
  </tbody>
</table>'
  const copy=()=>{navigator.clipboard.writeText(html);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">Rows:</label>
            <input type="number" value={rows} onChange={e=>setRows2(Number(e.target.value))} min="1" max="20" className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-center"/></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">Cols:</label>
            <input type="number" value={cols} onChange={e=>setCols2(Number(e.target.value))} min="1" max="10" className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-center"/></div>
          {[['Bordered',bordered,setBordered],['Striped',striped,setStriped]].map(([l,v,s])=>(
            <label key={l as string} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{l as string}
            </label>
          ))}
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>{headers.map((h,i)=>(
                <th key={i} className="border border-gray-300 bg-gray-50 p-0">
                  <input value={h} onChange={e=>updateHeader(i,e.target.value)} className="w-full px-2 py-1.5 font-semibold bg-transparent text-center text-xs focus:outline-none focus:bg-blue-50"/>
                </th>
              ))}</tr>
            </thead>
            <tbody>
              {cells.map((row,ri)=>(
                <tr key={ri} className={striped&&ri%2===1?'bg-gray-50':''}>
                  {row.map((cell,ci)=>(
                    <td key={ci} className="border border-gray-300 p-0">
                      <input value={cell} onChange={e=>updateCell(ri,ci,e.target.value)} className="w-full px-2 py-1.5 bg-transparent text-xs focus:outline-none focus:bg-blue-50"/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Generated HTML</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-3 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre">{html}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}