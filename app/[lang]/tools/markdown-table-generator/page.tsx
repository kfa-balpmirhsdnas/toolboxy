'use client'
import {useState,useMemo} from 'react'
import ToolLayout from '@/components/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [rows,setRows]=useState(3)
  const [cols,setCols]=useState(3)
  const [cells,setCells]=useState([['Header 1','Header 2','Header 3'],['Cell 1','Cell 2','Cell 3'],['Cell 4','Cell 5','Cell 6']])
  const resize=(r,c)=>{ setRows(r);setCols(c);setCells(Array.from({length:r},(_,ri)=>Array.from({length:c},(_,ci)=>(cells[ri]||[])[ci]||''))) }
  const setCell=(r,c,v)=>{ const n=cells.map(row=>[...row]);n[r][c]=v;setCells(n) }
  const md=useMemo(()=>{
    if(!cells.length)return ''
    const widths=Array.from({length:cols},(_,c)=>Math.max(3,...cells.map(r=>(r[c]||'').length)))
    const pad=(s,n)=>s+' '.repeat(Math.max(0,n-s.length))
    const rowStr=r=>'| '+r.map((c,i)=>pad(c||'',widths[i])).join(' | ')+' |'
    const sep='| '+widths.map(w=>'-'.repeat(w)).join(' | ')+' |'
    return [rowStr(cells[0]||[]),sep,...cells.slice(1).map(r=>rowStr(r))].join('\n')
  },[cells,cols])
  const tool=TOOLS.find(t=>t.slug==='markdown-table-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">Rows
            <input type="number" min={1} max={20} value={rows} onChange={e=>resize(+e.target.value,cols)} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"/></label>
          <label className="flex items-center gap-2 text-sm text-gray-700">Cols
            <input type="number" min={1} max={10} value={cols} onChange={e=>resize(rows,+e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"/></label>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="border-collapse w-full">
            <tbody>{cells.map((row,r)=>(
              <tr key={r} className={r===0?'bg-gray-50':''}>
                {row.map((c,ci)=><td key={ci} className="border border-gray-200 p-0">
                  <input value={c} onChange={e=>setCell(r,ci,e.target.value)} className={'w-full text-sm px-2 py-1.5 bg-transparent outline-none'+(r===0?' font-semibold':'')} placeholder={r===0?'Header':'Cell'}/>
                </td>)}
              </tr>
            ))}</tbody>
          </table></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Markdown</label>
          <textarea value={md} readOnly rows={rows+2} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(md)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
      </div>
    </ToolLayout>
  )
}