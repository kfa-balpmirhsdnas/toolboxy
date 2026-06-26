'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function calcSpec(sel){
  let s=sel.trim()
  const ids=(s.match(/#[a-zA-Z][\w-]*/g)||[]).length
  s=s.replace(/#[a-zA-Z][\w-]*/g,'')
  const cls=(s.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g)||[]).length
  s=s.replace(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g,'')
  const el=(s.match(/[a-zA-Z][a-zA-Z0-9-]*/g)||[]).length
  return [ids,cls,el]
}
const EX=['div','#main','.class','div p','#nav .item','a:hover','input[type]']
export default function Page(){
  const t = useTranslations('toolui')
  const [sel,setSel]=useState('#header .nav-item')
  const [act,setAct]=useState(-1)
  const lines=sel.split('\n').filter(s=>s.trim())
  const results=lines.map(s=>({s:s.trim(),sp:calcSpec(s.trim())}))
  const sp2s=(sp)=>sp.join(',')
  const tool=TOOLS.find(x=>x.slug==='css-specificity-calculator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('spec_label')}</label>
          <textarea value={sel} onChange={e=>setSel(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div className="space-y-2">{results.map(r=>(
          <div key={r.s} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm font-mono text-gray-800">{r.s}</code>
            <span className="font-bold font-mono text-blue-600">{sp2s(r.sp)}</span>
            <span className="text-xs text-gray-400">({r.sp[0]*100+r.sp[1]*10+r.sp[2]})</span>
          </div>
        ))}</div>
        <div><p className="text-xs text-gray-500 mb-2">{t('spec_examples')}</p>
          <div className="flex flex-wrap gap-1">{EX.map((e,i)=>(
            <button key={e} onClick={()=>setAct(i===act?-1:i)} className="px-2.5 py-1 rounded border border-gray-200 text-xs font-mono hover:bg-gray-50">{e}</button>
          ))}</div>
          {act>=0&&<div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm"><code>{EX[act]}</code> → <strong>{sp2s(calcSpec(EX[act]))}</strong></div>}
        </div>
      </div>
    </ToolLayout>
  )
}