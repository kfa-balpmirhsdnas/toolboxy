'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('currency-formatter')!
const CURRENCIES=[{code:'USD',name:'US Dollar',symbol:'$'},{code:'EUR',name:'Euro',symbol:'€'},{code:'GBP',name:'British Pound',symbol:'£'},{code:'JPY',name:'Japanese Yen',symbol:'¥'},{code:'KRW',name:'Korean Won',symbol:'₩'},{code:'CNY',name:'Chinese Yuan',symbol:'¥'},{code:'CAD',name:'Canadian Dollar',symbol:'CA$'},{code:'AUD',name:'Australian Dollar',symbol:'A$'},{code:'CHF',name:'Swiss Franc',symbol:'CHF'},{code:'INR',name:'Indian Rupee',symbol:'₹'},{code:'BRL',name:'Brazilian Real',symbol:'R$'},{code:'MXN',name:'Mexican Peso',symbol:'MX$'},{code:'RUB',name:'Russian Ruble',symbol:'₽'},{code:'SGD',name:'Singapore Dollar',symbol:'S$'},{code:'HKD',name:'Hong Kong Dollar',symbol:'HK$'},{code:'NOK',name:'Norwegian Krone',symbol:'kr'},{code:'SEK',name:'Swedish Krona',symbol:'kr'},{code:'DKK',name:'Danish Krone',symbol:'kr'}]
const LOCALES=[{code:'en-US',name:'English (US)'},{code:'en-GB',name:'English (UK)'},{code:'de-DE',name:'German'},{code:'fr-FR',name:'French'},{code:'ja-JP',name:'Japanese'},{code:'ko-KR',name:'Korean'},{code:'zh-CN',name:'Chinese'},{code:'pt-BR',name:'Portuguese (BR)'},{code:'es-ES',name:'Spanish'}]
export default function CurrencyFormatterPage() {
  const [num,setNum]=useState('1234567.89')
  const [currency,setCurrency]=useState('USD')
  const [locale,setLocale]=useState('en-US')
  const [decimals,setDecimals]=useState(2)
  const n=parseFloat(num.replace(/,/g,''))||0
  const formatted=new Intl.NumberFormat(locale,{style:'currency',currency,minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(n)
  const plain=new Intl.NumberFormat(locale,{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(n)
  const [copied,setCopied]=useState('')
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
          <input type="text" value={num} onChange={e=>setNum(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-2xl font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Currency</label>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
              {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.code} - {c.name.split(' ')[0]}</option>)}</select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Locale</label>
            <select value={locale} onChange={e=>setLocale(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
              {LOCALES.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Decimals</label>
            <select value={decimals} onChange={e=>setDecimals(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
              {[0,1,2,3,4].map(d=><option key={d}>{d}</option>)}</select></div>
        </div>
        <div className="space-y-2">
          {[{label:'With currency symbol',value:formatted},{label:'Number only',value:plain},{label:'Raw number',value:n.toFixed(decimals)}].map(r=>(
            <div key={r.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-500">{r.label}</p>
                <p className="text-xl font-bold font-mono text-gray-800">{r.value}</p>
              </div>
              <button onClick={()=>copy(r.value)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">{copied===r.value?'Copied!':'Copy'}</button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}