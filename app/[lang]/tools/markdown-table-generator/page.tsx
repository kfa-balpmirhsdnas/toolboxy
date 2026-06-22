'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('markdown-table-generator')!

type Align = 'left'|'center'|'right'

function toMarkdown(headers: string[], rows: string[][], aligns: Align[]): string {
  const colWidths = headers.map((h,i) => Math.max(h.length, 3, ...rows.map(r=>(r[i]||'').length)))
  const pad = (s:string,w:number,a:Align) => a==='right'?s.padStart(w):a==='center'?(s.padStart(Math.floor((w+s.length)/2)).padEnd(w)):s.padEnd(w)
  const sep = (w:number,a:Align) => a==='center'?':'+'-'.repeat(w-2)+':':a==='right'?'-'.repeat(w-1)+':':'-'.repeat(w)
  const hRow = '| ' + headers.map((h,i)=>pad(h,colWidths[i],aligns[i])).join(' | ') + ' |'
  const sRow = '| ' + colWidths.map((w,i)=>sep(w,aligns[i])).join(' | ') + ' |'
  const dRows = rows.map(r=>'| ' + r.map((c,i)=>pad(c||'',colWidths[i],aligns[i])).join(' | ') + ' |')
  return [hRow,sRow,...dRows].join('\n')
}

function toHtml(headers: string[], rows: string[][], aligns: Align[]): string {
  const th = headers.map((h,i)=>`<th style="text-align:${aligns[i]}">${h}</th>`).join('')
  const trs = rows.map(r=>'<tr>'+r.map((c,i)=>`<td style="text-align:${aligns[i]}">${c||''}</td>`).join('')+'</tr>').join('\n')
  return `<table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${trs}\n</tbody>\n</table>`
}

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (s:string) => s.includes(',') ? `"${s}"` : s
  return [headers.map(escape).join(','), ...rows.map(r=>r.map(escape).join(','))].join('\n')
}

export default function MarkdownTableGeneratorPage({ params }: { params: { lang: string } }) {
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)
  const [headers, setHeaders] = useState(['Column 1','Column 2','Column 3'])
  const [data, setData] = useState([['','',''],['','',''],['','','']])
  const [aligns, setAligns] = useState<Align[]>(['left','left','left'])
  const [format, setFormat] = useState<'markdown'|'html'|'csv'>('markdown')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('markdown-table-generator'); tracked.current = true } }

  function addCol() {
    setCols(c=>c+1)
    setHeaders(h=>[...h,'Column '+(cols+1)])
    setAligns(a=>[...a,'left'])
    setData(d=>d.map(r=>[...r,'']).concat())
    track()
  }
  function addRow() { setRows(r=>r+1); setData(d=>[...d,Array(cols).fill('')]); track() }
  function delCol() { if(cols<=1)return; setCols(c=>c-1); setHeaders(h=>h.slice(0,-1)); setAligns(a=>a.slice(0,-1)); setData(d=>d.map(r=>r.slice(0,-1))); track() }
  function delRow() { if(rows<=1)return; setRows(r=>r-1); setData(d=>d.slice(0,-1)); track() }

  const output = format==='markdown' ? toMarkdown(headers,data,aligns) : format==='html' ? toHtml(headers,data,aligns) : toCsv(headers,data)

  async function copy() { await navigator.clipboard.writeText(output); trackToolCopy('markdown-table-generator'); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  function download() {
    const ext = format==='markdown'?'md':format==='html'?'html':'csv'
    const blob = new Blob([output],{type:'text/plain'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='table.'+ext; a.click()
    trackToolDownload('markdown-table-generator', ext)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={addCol} className="px-3 py-1.5 rounded-lg text-xs bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100">+ Col</button>
          <button onClick={delCol} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">- Col</button>
          <button onClick={addRow} className="px-3 py-1.5 rounded-lg text-xs bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100">+ Row</button>
          <button onClick={delRow} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">- Row</button>
          <div className="flex gap-1 ml-auto">
            {(['markdown','html','csv'] as const).map(f=>(
              <button key={f} onClick={()=>{setFormat(f);track()}}
                className={'px-2.5 py-1.5 rounded-lg text-xs uppercase transition-colors ' + (format===f?'bg-gray-700 text-white':'bg-gray-100 text-gray-600')}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h,i)=>(
                  <th key={i} className="border border-gray-200 p-0">
                    <div className="flex flex-col gap-0">
                      <input value={h} onChange={e=>{const nh=[...headers];nh[i]=e.target.value;setHeaders(nh);track()}}
                        className="w-full px-2 py-1.5 text-xs font-bold text-center focus:outline-none bg-gray-50 border-b border-gray-200" placeholder={"Col "+(i+1)} />
                      <select value={aligns[i]} onChange={e=>{const na=[...aligns];na[i]=e.target.value as Align;setAligns(na);track()}}
                        className="text-xs px-1 py-0.5 border-0 bg-white focus:outline-none text-center">
                        <option value="left">←</option>
                        <option value="center">↔</option>
                        <option value="right">→</option>
                      </select>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row,ri)=>(
                <tr key={ri}>
                  {row.map((cell,ci)=>(
                    <td key={ci} className="border border-gray-200 p-0">
                      <input value={cell} onChange={e=>{const nd=data.map(r=>[...r]);nd[ri][ci]=e.target.value;setData(nd);track()}}
                        className="w-full px-2 py-1.5 text-xs focus:outline-none focus:bg-brand-50" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Output</label>
            <div className="flex gap-2">
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy'}</button>
              <button onClick={download} className="text-xs text-gray-500 hover:text-gray-700">Download</button>
            </div>
          </div>
          <pre className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono overflow-x-auto">{output}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
