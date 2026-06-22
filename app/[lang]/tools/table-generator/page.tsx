'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('table-generator')!

type Align = 'left'|'center'|'right'
type Format = 'markdown'|'html'|'csv'|'tsv'

const INIT_COLS = 3
const INIT_ROWS = 3

export default function TableGeneratorPage({ params }: { params: { lang: string } }) {
  const [headers, setHeaders] = useState(Array(INIT_COLS).fill('').map((_,i)=>['Name','Value','Description'][i]||'Col '+(i+1)))
  const [rows, setRows] = useState<string[][]>(Array(INIT_ROWS).fill(null).map((_,i)=>Array(INIT_COLS).fill('').map((_,j)=>'Row '+(i+1)+' Col '+(j+1))))
  const [aligns, setAligns] = useState<Align[]>(Array(INIT_COLS).fill('left'))
  const [format, setFormat] = useState<Format>('markdown')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('table-generator'); tracked.current = true } }

  function addCol() {
    setHeaders(h=>[...h,'Col '+(h.length+1)])
    setAligns(a=>[...a,'left'])
    setRows(r=>r.map(row=>[...row,'']))
    track()
  }
  function removeCol() {
    if (headers.length <= 1) return
    setHeaders(h=>h.slice(0,-1))
    setAligns(a=>a.slice(0,-1))
    setRows(r=>r.map(row=>row.slice(0,-1)))
  }
  function addRow() { setRows(r=>[...r, Array(headers.length).fill('')]); track() }
  function removeRow() { if (rows.length > 0) setRows(r=>r.slice(0,-1)) }

  function updateHeader(i: number, val: string) { setHeaders(h=>{const n=[...h];n[i]=val;return n}); track() }
  function updateCell(ri: number, ci: number, val: string) { setRows(r=>{const n=r.map(row=>[...row]);n[ri][ci]=val;return n}); track() }
  function toggleAlign(i: number) { setAligns(a=>{const n=[...a];n[i]=n[i]==='left'?'center':n[i]==='center'?'right':'left';return n}) }

  function generate(): string {
    const cols = headers.length
    if (format === 'markdown') {
      const header = '| ' + headers.join(' | ') + ' |'
      const sep = '| ' + aligns.map((a,i)=>a==='center'?':---:':a==='right'?'---:':'---').join(' | ') + ' |'
      const body = rows.map(row=>'| ' + row.map((c,i)=>c||'').join(' | ') + ' |').join('\n')
      return [header,sep,body].join('\n')
    }
    if (format === 'html') {
      const th = '  <tr>\n' + headers.map((h,i)=>'    <th style="text-align:'+aligns[i]+'">'+h+'</th>').join('\n') + '\n  </tr>'
      const trs = rows.map(row=>'  <tr>\n'+row.map((c,i)=>'    <td style="text-align:'+aligns[i]+'">'+c+'</td>').join('\n')+'\n  </tr>').join('\n')
      return '<table>\n<thead>\n'+th+'\n</thead>\n<tbody>\n'+trs+'\n</tbody>\n</table>'
    }
    const delim = format==='csv' ? ',' : '\t'
    const escCsv = (s: string) => format==='csv'&&(s.includes(','))||s.includes('"')||s.includes('\n') ? '"'+s.replace(/"/g,'""')+'"' : s
    const header = headers.map(escCsv).join(delim)
    const body = rows.map(row=>row.map(escCsv).join(delim)).join('\n')
    return header+'\n'+body
  }

  const output = generate()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('table-generator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }
  function download() {
    const ext = format==='markdown'?'md':format==='html'?'html':format==='csv'?'csv':'tsv'
    const blob=new Blob([output],{type:'text/plain'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='table.'+ext;a.click();URL.revokeObjectURL(url)
    trackToolDownload('table-generator',ext)
  }

  const ALIGN_ICONS = { left:'\u21D0', center:'\u2194', right:'\u21D2' }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          {(['markdown','html','csv','tsv'] as Format[]).map(f=>(
            <button key={f} onClick={()=>setFormat(f)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium uppercase transition-colors ' + (format===f?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {f}
            </button>
          ))}
          <div className="flex gap-1 ml-auto">
            {[['Col -',removeCol],['Col +',addCol],['Row -',removeRow],['Row +',addRow]].map(([label,fn])=>(
              <button key={label as string} onClick={fn as ()=>void}
                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs transition-colors">
                {label as string}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h,i)=>(
                  <th key={i} className="border border-gray-200 p-1">
                    <input value={h} onChange={e=>updateHeader(i,e.target.value)}
                      className="w-full px-2 py-1 text-sm font-semibold text-center bg-gray-50 focus:outline-none focus:bg-white border border-transparent focus:border-brand-300 rounded" />
                    <button onClick={()=>toggleAlign(i)} className="w-full text-xs text-gray-400 hover:text-brand-600 mt-0.5">
                      {ALIGN_ICONS[aligns[i]]} {aligns[i]}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row,ri)=>(
                <tr key={ri}>
                  {row.map((cell,ci)=>(
                    <td key={ci} className="border border-gray-200 p-1">
                      <input value={cell} onChange={e=>updateCell(ri,ci,e.target.value)}
                        className="w-full px-2 py-1 text-sm focus:outline-none focus:bg-blue-50 rounded border border-transparent focus:border-brand-300" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{format.toUpperCase()} Output</label>
            <div className="flex gap-2">
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
              <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
            </div>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-48">{output}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
