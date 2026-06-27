'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('discount-calculator')!
export default function DiscountCalculatorPage() {
  const t = useTranslations('toolui')
  const [mode,setMode]=useState<'pct'|'find-pct'|'find-orig'>('pct')
  const [orig,setOrig]=useState('100')
  const [disc,setDisc]=useState('20')
  const [final,setFinal]=useState('80')
  const o=parseFloat(orig),d=parseFloat(disc),f=parseFloat(final)
  let result:{label:string;val:string}[]=[]
  if(mode==='pct'&&o&&d){
    const save=o*d/100,fp=o-save
    result=[{label:t('dc_sale'),val:'$'+fp.toFixed(2)},{label:t('dc_save'),val:'$'+save.toFixed(2)+' ('+d+'%)'},{label:t('dc_orig'),val:'$'+o.toFixed(2)}]
  } else if(mode==='find-pct'&&o&&f){
    const pct=((o-f)/o*100)
    result=[{label:t('dc_disc'),val:pct.toFixed(2)+'%'},{label:t('dc_save'),val:'$'+(o-f).toFixed(2)},{label:t('dc_final'),val:'$'+f.toFixed(2)}]
  } else if(mode==='find-orig'&&f&&d){
    const op=f/(1-d/100)
    result=[{label:t('dc_orig'),val:'$'+op.toFixed(2)},{label:t('dc_save'),val:'$'+(op-f).toFixed(2)},{label:t('dc_final'),val:'$'+f.toFixed(2)}]
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {[['pct',t('dc_m_sale')],['find-pct',t('dc_m_pct')],['find-orig',t('dc_m_orig')]].map(([id,label])=>(
            <button key={id} onClick={()=>setMode(id as typeof mode)}
              className={`rounded-lg border p-2.5 text-xs font-medium text-center transition ${mode===id?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>
        <div className="space-y-3">
          {(mode==='pct'||mode==='find-pct')&&<div><label className="block text-sm font-medium text-gray-700 mb-1">{t('dc_orig')} ($)</label>
            <input type="number" value={orig} onChange={e=>setOrig(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>}
          {(mode==='pct'||mode==='find-orig')&&<div><label className="block text-sm font-medium text-gray-700 mb-1">{t('dc_disc')} (%)</label>
            <input type="number" value={disc} onChange={e=>setDisc(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>}
          {(mode==='find-pct'||mode==='find-orig')&&<div><label className="block text-sm font-medium text-gray-700 mb-1">{t('dc_final')} ($)</label>
            <input type="number" value={final} onChange={e=>setFinal(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>}
        </div>
        {result.length>0&&(
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {result.map(r=>(
              <div key={r.label} className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="text-lg font-bold text-blue-700">{r.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
