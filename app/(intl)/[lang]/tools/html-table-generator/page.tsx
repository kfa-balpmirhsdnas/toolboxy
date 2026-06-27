'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='html-table-generator')
  const [rows,setRows]=useState(3)
  const [cols,setCols]=useState(3)
  const [hasHeader,setHasHeader]=useState(true)
  const [bordered,setBordered]=useState(true)
  const [striped,setStriped]=useState(false)

  const borderStyle=bordered?'border:1px solid #ccc;border-collapse:collapse;':''
  const cellStyle=bordered?'border:1px solid #ccc;padding:8px 12px;':' padding:8px 12px;'

  function buildHtml(){
    let html='<table style="'+borderStyle+'">'
    if(hasHeader){
      html+='\n  <thead><tr>'
      for(let c=1;c<=cols;c++) html+='<th style="'+cellStyle+'background:#f5f5f5;">Header '+c+'</th>'
      html+='</tr></thead>'
    }
    html+='\n  <tbody>'
    for(let r=1;r<=rows;r++){
      const bg=striped&&r%2===0?'background:#f9f9f9;':''
      html+='\n    <tr>'
      for(let c=1;c<=cols;c++) html+='<td style="'+cellStyle+bg+'">Row '+r+', Col '+c+'</td>'
      html+='</tr>'
    }
    html+='\n  </tbody>\n</table>'
    return html
  }

  const html=buildHtml()

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-4 flex-wrap'>
          <label className='flex items-center gap-2 text-sm'>
            {t('htg_rows')} <input type='number' min={1} max={20} value={rows} onChange={e=>setRows(Number(e.target.value))} className='border rounded px-2 py-1 w-16'/>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            {t('htg_cols')} <input type='number' min={1} max={10} value={cols} onChange={e=>setCols(Number(e.target.value))} className='border rounded px-2 py-1 w-16'/>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={hasHeader} onChange={e=>setHasHeader(e.target.checked)}/> {t('htg_header')}
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={bordered} onChange={e=>setBordered(e.target.checked)}/> {t('htg_borders')}
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={striped} onChange={e=>setStriped(e.target.checked)}/> {t('htg_striped')}
          </label>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('htg_preview')}</label>
          <div className='border rounded p-4 overflow-auto'
            dangerouslySetInnerHTML={{__html:html}}/>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>HTML</label>
          <textarea readOnly value={html}
            className='w-full h-36 p-3 border rounded font-mono text-xs bg-gray-50 resize-y'/>
        </div>
        <button onClick={()=>navigator.clipboard.writeText(html)}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'>
          {t('htg_copyhtml')}
        </button>
      </div>
    </ToolLayout>
  )
}