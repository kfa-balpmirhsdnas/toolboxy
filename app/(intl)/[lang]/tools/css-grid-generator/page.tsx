'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const t = useTranslations('toolui')
  const [cols,setCols]=useState(3)
  const [rows,setRows]=useState(3)
  const [cg,setCg]=useState(16)
  const [rg,setRg]=useState(16)
  const [colT,setColT]=useState('1fr 1fr 1fr')
  const [rowT,setRowT]=useState('100px 100px 100px')
  const css='.grid-container {\n  display: grid;\n  grid-template-columns: '+colT+';\n  grid-template-rows: '+rowT+';\n  column-gap: '+cg+'px;\n  row-gap: '+rg+'px;\n}'
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard?.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const tool=TOOLS.find(x=>x.slug==='css-grid-generator')
  const COLORS=['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4','#84cc16','#f97316']
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cgr_columns')}
            <input type="number" min={1} max={6} value={cols} onChange={e=>{setCols(+e.target.value);setColT(Array(+e.target.value).fill('1fr').join(' '))}} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cgr_rows')}
            <input type="number" min={1} max={6} value={rows} onChange={e=>{setRows(+e.target.value);setRowT(Array(+e.target.value).fill('100px').join(' '))}} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cgr_colgap')}
            <input type="number" min={0} max={48} value={cg} onChange={e=>setCg(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">{t('cgr_rowgap')}
            <input type="number" min={0} max={48} value={rg} onChange={e=>setRg(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-sm text-gray-700 col-span-2">grid-template-columns
            <input value={colT} onChange={e=>setColT(e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"/></label>
          <label className="flex flex-col gap-1 text-sm text-gray-700 col-span-2">grid-template-rows
            <input value={rowT} onChange={e=>setRowT(e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"/></label>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div style={{display:'grid',gridTemplateColumns:colT,gridTemplateRows:rowT,columnGap:cg+'px',rowGap:rg+'px'}}>
            {Array.from({length:cols*rows},(_,i)=><div key={i} style={{background:COLORS[i%COLORS.length],borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,minHeight:40}}>{i+1}</div>)}
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <textarea value={css} readOnly rows={7} className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          <button onClick={copy} className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
        </div>
      </div>
    </ToolLayout>
  )
}