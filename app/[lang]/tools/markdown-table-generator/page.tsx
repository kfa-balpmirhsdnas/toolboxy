'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('markdown-table-generator')!
type Align='left'|'center'|'right'
export default function MarkdownTableGeneratorPage() {
  const [rows,setRows]=useState(3)
  const [cols,setCols]=useState(3)
  const [headers,setHeaders]=useState(['Name','Age','City'])
  const [data,setData]=useState([['Alice','30','New York'],['Bob','25','London'],['Carol','35','Tokyo']])
  const [aligns,setAligns]=useState<Align[]>(['left','left','left'])
  const [copied,setCopied]=useState(false)
  const setRows2=(n:number)=>{const nr=Math.max(1,Math.min(20,n));setRows(nr);setData(d=>{const nd=[...d];while(nd.length<nr)nd.push(Array(cols).fill(''));while(nd.length>nr)nd.pop();return nd})}
  const setCols2=(n:number)=>{const nc=Math.max(1,Math.min(8,n));setCols(nc);setHeaders(h=>{const nh=[...h];while(nh.length<nc)nh.push('Col '+(nh.length+1));while(nh.length>nc)nh.pop();return nh});setAligns(a=>{const na=[...a];while(na.length<nc)na.push('left');while(na.length>nc)na.pop();return na});setData(d=>d.map(r=>{const nr=[...r];while(nr.length<nc)nr.push('');while(nr.length>nc)nr.pop();return nr}))}
  const pad=(s:string,w:number)=>s+' '.repeat(Math.max(0,w-s.length))
  const colWidths=Array.from({length:cols},(_,i)=>Math.max(3,headers[i]?.length||3,...data.map(r=>r[i]?.length||0)))
  const sepChar=(a:Align,i:number)=>a==='left'?':'+'-'.repeat(colWidths[i]-1):a==='right'?'-'.repeat(colWidths[i]-1)+':':':'+'-'.repeat(colWidths[i]-2)+':'
  const md=['| '+headers.map((h,i)=>pad(h,colWidths[i])).join(' | ')+' |','| '+aligns.map((a,i)=>sepChar(a,i)).join(' | ')+' |',...data.map(r=>'| '+r.map((c,i)=>pad(c,colWidths[i])).join(' | ')+' |')].join('
')
  const copy=()=>{navigator.clipboard.writeText(md);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">Rows:</label>
            <input type="number" value={rows} onChange={e=>setRows2(Number(e.target.value))} min="1" max="20" className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-center"/></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">Cols:</label>
            <input type="number" value={cols} onChange={e=>setCols2(Number(e.target.value))} min="1" max="8" className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-center"/></div>
        </div>
        <div className="overflow-auto">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr>
                {headers.map((h,i)=>(
                  <th key={i} className="border border-gray-300 bg-gray-50 p-0 min-w-24">
                    <input value={h} onChange={e=>{const nh=[...headers];nh[i]=e.target.value;setHeaders(nh)}} className="w-full px-2 py-1.5 font-semibold bg-transparent text-center text-xs focus:outline-none focus:bg-blue-50"/>
                    <select value={aligns[i]} onChange={e=>{const na=[...aligns];na[i]=e.target.value as Align;setAligns(na)}} className="w-full border-t border-gray-300 bg-gray-50 text-xs text-center py-0.5">
                      <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row,ri)=>(
                <tr key={ri} className={ri%2===1?'bg-gray-50':''}>
                  {row.map((c,ci)=>(
                    <td key={ci} className="border border-gray-300 p-0">
                      <input value={c} onChange={e=>{const nd=data.map((r,rr)=>rr===ri?r.map((cc,cc2)=>cc2===ci?e.target.value:cc):r);setData(nd)}} className="w-full px-2 py-1.5 bg-transparent text-xs focus:outline-none focus:bg-blue-50"/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Markdown table</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-3 text-green-400 font-mono text-xs overflow-x-auto">{md}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}