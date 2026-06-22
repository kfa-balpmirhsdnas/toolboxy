'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-formatter')!
const LOCALES=[{label:'US English',code:'en-US'},{label:'German',code:'de-DE'},{label:'French',code:'fr-FR'},{label:'Japanese',code:'ja-JP'},{label:'Indian',code:'en-IN'},{label:'Arabic',code:'ar-EG'},{label:'Swiss',code:'de-CH'},{label:'Swedish',code:'sv-SE'}]
const STYLES=['decimal','currency','percent','scientific'] as const
type Style=typeof STYLES[number]
export default function NumberFormatterPage() {
  const [value,setValue]=useState('1234567.89')
  const [locale,setLocale]=useState('en-US')
  const [style,setStyle]=useState<Style>('decimal')
  const [currency,setCurrency]=useState('USD')
  const [decimals,setDecimals]=useState(2)
  const [copied,setCopied]=useState('')
  const num=parseFloat(value.replace(/,/g,''))
  const fmt=(loc:string)=>{
    if(isNaN(num))return'Invalid number'
    try{
      const opts:Intl.NumberFormatOptions={minimumFractionDigits:decimals,maximumFractionDigits:decimals}
      if(style==='currency'){opts.style='currency';opts.currency=currency}
      else if(style==='percent'){opts.style='percent';opts.minimumFractionDigits=1}
      else if(style==='scientific'){return num.toExponential(decimals)}
      return new Intl.NumberFormat(loc,opts).format(style==='percent'?num/100:num)
    }catch(e){return'Error: '+String(e)}
  }
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1000)}
  const result=fmt(locale)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-xs text-gray-500 mb-1">Number</label>
          <input value={value} onChange={e=>setValue(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 font-mono text-2xl text-center font-bold focus:outline-none focus:border-blue-400"/></div>
        <div className="flex gap-1 flex-wrap">
          {STYLES.map(s=>(
            <button key={s} onClick={()=>setStyle(s)}
              className={'px-3 py-1.5 rounded-full border text-xs capitalize font-medium transition '+(style===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600 hover:bg-gray-50')}>{s}</button>
          ))}
        </div>
        {style==='currency'&&(
          <div className="flex items-center gap-2"><label className="text-xs text-gray-600">Currency:</label>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
              {['USD','EUR','GBP','JPY','CHF','CNY','KRW','INR'].map(c=><option key={c}>{c}</option>)}
            </select></div>
        )}
        {style!=='scientific'&&<div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Decimal places:</label>
          <input type="number" value={decimals} onChange={e=>setDecimals(Number(e.target.value))} min="0" max="10"
            className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none"/>
        </div>}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-2xl font-bold text-blue-700 font-mono">{result}</p>
          <button onClick={()=>copy(result)} className="text-xs text-blue-600 hover:text-blue-800">{copied===result?'✓ Copied':'Copy'}</button>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-600">All locales</p>
          {LOCALES.map(loc=>{
            const v=fmt(loc.code)
            return(
              <div key={loc.code} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 w-24">{loc.label}</span>
                <span className="font-mono font-medium text-gray-800 text-sm flex-1">{v}</span>
                <button onClick={()=>copy(v)} className="text-xs text-blue-400 hover:text-blue-600 ml-2">{copied===v?'✓':'Copy'}</button>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}