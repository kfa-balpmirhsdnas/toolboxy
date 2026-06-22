'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('discount-calculator')!
export default function DiscountCalculatorPage() {
  const [mode,setMode]=useState<'pct'|'find-pct'|'find-orig'>('pct')
  const [orig,setOrig]=useState('100')
  const [disc,setDisc]=useState('20')
  const [final,setFinal]=useState('80')
  const o=parseFloat(orig),d=parseFloat(disc),f=parseFloat(final)
  let result:{label:string;val:string}[]=[]
  if(mode==='pct'&&o&&d){
    const save=o*d/100,fp=o-save
    result=[{label:'Sale Price',val:'$'+fp.toFixed(2)},{label:'You Save',val:'$'+save.toFixed(2)+' ('+d+'%)'},{label:'Original',val:'$'+o.toFixed(2)}]
  } else if(mode==='find-pct'&&o&&f){
    const pct=((o-f)/o*100)
    result=[{label:'Discount',val:pct.toFixed(2)+'%'},{label:'Savings',val:'$'+(o-f).toFixed(2)},{label:'Final Price',val:'$'+f.toFixed(2)}]
  } else if(mode==='find-orig'&&f&&d){
    const op=f/(1-d/100)
    result=[{label:'Original Price',val:'$'+op.toFixed(2)},{label:'You Saved',val:'$'+(op-f).toFixed(2)},{label:'Final Price',val:'$'+f.toFixed(2)}]
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {[['pct','Find sale price'],['find-pct','Find % off'],['find-orig','Find original']].map(([id,label])=>(
            <button key={id} onClick={()=>setMode(id as typeof mode)}
              className={`rounded-lg border p-2.5 text-xs font-medium text-center transition ${mode===id?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>
        <div className="space-y-3">
          {(mode==='pct'||mode==='find-pct')&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
            <input type="number" value={orig} onChange={e=>setOrig(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>}
          {(mode==='pct'||mode==='find-orig')&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input type="number" value={disc} onChange={e=>setDisc(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>}
          {(mode==='find-pct'||mode==='find-orig')&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Final Price ($)</label>
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