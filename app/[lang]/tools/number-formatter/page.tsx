'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-formatter')!
export default function NumberFormatterPage() {
  const [num,setNum]=useState('1234567.89')
  const [dec,setDec]=useState(2)
  const [locale,setLocale]=useState('en-US')
  const [style,setStyle]=useState<'decimal'|'currency'|'percent'>('decimal')
  const [currency,setCurrency]=useState('USD')
  const n=parseFloat(num.replace(/,/g,''))
  const formatted=isNaN(n)?'':new Intl.NumberFormat(locale,{
    style,
    currency:style==='currency'?currency:undefined,
    minimumFractionDigits:style==='percent'?1:dec,
    maximumFractionDigits:style==='percent'?1:dec,
  }).format(style==='percent'?n/100:n)
  const LOCALES=[{label:'English (US)',val:'en-US'},{label:'German',val:'de-DE'},{label:'French',val:'fr-FR'},{label:'Japanese',val:'ja-JP'},{label:'Korean',val:'ko-KR'},{label:'Indian',val:'en-IN'}]
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(formatted);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Number input</label>
          <input value={num} onChange={e=>setNum(e.target.value)} placeholder="1234567.89" className="w-full rounded border border-gray-300 px-3 py-2.5 text-xl font-mono"/></div>
        <div className="grid grid-cols-3 gap-2">
          {(['decimal','currency','percent'] as const).map(s=>(
            <button key={s} onClick={()=>setStyle(s)}
              className={'py-2 rounded border text-sm font-medium capitalize transition '+(style===s?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Locale</label>
            <select value={locale} onChange={e=>setLocale(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
              {LOCALES.map(l=><option key={l.val} value={l.val}>{l.label}</option>)}
            </select></div>
          {style==='currency'&&<div><label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
              {['USD','EUR','GBP','JPY','KRW','CNY','AUD','CAD','CHF','INR'].map(c=><option key={c} value={c}>{c}</option>)}
            </select></div>}
          {style==='decimal'&&<div><label className="block text-xs font-medium text-gray-600 mb-1">Decimal places: {dec}</label>
            <input type="range" min="0" max="6" value={dec} onChange={e=>setDec(Number(e.target.value))} className="w-full mt-2"/></div>}
        </div>
        {formatted&&(
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Formatted result</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-800 flex-1">{formatted}</p>
              <button onClick={copy} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}