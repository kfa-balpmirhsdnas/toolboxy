'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='table-generator')
  const [rows,setRows]=useState(3)
  const [cols,setCols]=useState(3)
  const [format,setFormat]=useState<'html'|'markdown'|'csv'>('markdown')
  const [hasHeader,setHasHeader]=useState(true)

  function buildMarkdown(){
    const lines:string[]=[]
    if(hasHeader){
      const headers=Array.from({length:cols},(_,i)=>'Header '+(i+1))
      lines.push('| '+headers.join(' | ')+' |')
      lines.push('| '+headers.map(()=>'---').join(' | ')+' |')
    }
    for(let r=1;r<=rows;r++){
      const cells=Array.from({length:cols},(_,c)=>'Row '+r+', Col '+(c+1))
      lines.push('| '+cells.join(' | ')+' |')
    }
    return lines.join('\n')
  }

  function buildHtml(){
    let h='<table>\n'
    if(hasHeader){
      h+='  <thead>\n    <tr>'
      for(let c=1;c<=cols;c++) h+='<th>Header '+c+'</th>'
      h+='</tr>\n  </thead>\n'
    }
    h+='  <tbody>\n'
    for(let r=1;r<=rows;r++){
      h+='    <tr>'
      for(let c=1;c<=cols;c++) h+='<td>Row '+r+', Col '+c+'</td>'
      h+='</tr>\n'
    }
    h+='  </tbody>\n</table>'
    return h
  }

  function buildCsv(){
    const lines:string[]=[]
    if(hasHeader) lines.push(Array.from({length:cols},(_,i)=>'Header '+(i+1)).join(','))
    for(let r=1;r<=rows;r++){
      lines.push(Array.from({length:cols},(_,c)=>'Row '+r+' Col '+(c+1)).join(','))
    }
    return lines.join('\n')
  }

  const output=format==='markdown'?buildMarkdown():format==='html'?buildHtml():buildCsv()

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-4 flex-wrap'>
          <label className='flex items-center gap-2 text-sm'>
            Rows: <input type='number' min={1} max={20} value={rows} onChange={e=>setRows(Number(e.target.value))} className='border rounded px-2 py-1 w-16'/>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            Cols: <input type='number' min={1} max={10} value={cols} onChange={e=>setCols(Number(e.target.value))} className='border rounded px-2 py-1 w-16'/>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={hasHeader} onChange={e=>setHasHeader(e.target.checked)}/> Header
          </label>
        </div>
        <div className='flex gap-2'>
          {(['markdown','html','csv'] as const).map(f=>(
            <button key={f} onClick={()=>setFormat(f)}
              className={'px-3 py-1 rounded text-sm uppercase '+(format===f?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
              {f}
            </button>
          ))}
        </div>
        <textarea readOnly value={output}
          className='w-full h-48 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
        <button onClick={()=>navigator.clipboard.writeText(output)}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'>
          Copy Table
        </button>
      </div>
    </ToolLayout>
  )
}