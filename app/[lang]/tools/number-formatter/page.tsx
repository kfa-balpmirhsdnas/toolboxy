'use client'
import { useState } from 'react'

export default function NumberFormatterPage() {
  const [input, setInput] = useState('')
  const [locale, setLocale] = useState('en-US')
  const [style, setStyle] = useState<'decimal'|'currency'|'percent'>('decimal')
  const [currency, setCurrency] = useState('USD')
  const [decimals, setDecimals] = useState(2)
  const [copied, setCopied] = useState('')

  const num = parseFloat(input.replace(/,/g,''))
  const valid = !isNaN(num)

  const LOCALES=[{id:'en-US',label:'English (US)'},{id:'en-GB',label:'English (UK)'},{id:'de-DE',label:'German'},{id:'fr-FR',label:'French'},{id:'ja-JP',label:'Japanese'},{id:'ko-KR',label:'Korean'}]
  const CURRENCIES=['USD','EUR','GBP','JPY','KRW','CNY','AUD','CAD']

  function fmt(l:string,s:string,c:string,d:number):string{
    if(!valid) return ''
    try{
      return new Intl.NumberFormat(l,{
        style:s as any,
        ...(s==='currency'?{currency:c}:{}),
        minimumFractionDigits:s==='percent'?1:d,
        maximumFractionDigits:s==='percent'?1:d,
      }).format(s==='percent'?num/100:num)
    }catch{return 'Error'}
  }

  const result = fmt(locale,style,currency,decimals)
  function copy(v:string){navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Number Formatter</h1>
        <p className="text-gray-500 mb-8">Format numbers with locale-specific separators, currency symbols and percentage</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. 1234567.89"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['decimal','currency','percent'] as const).map(s=>(
              <button key={s} onClick={()=>setStyle(s)}
                className={'px-4 py-2 rounded-lg capitalize font-medium transition-colors '+(style===s?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
              <select value={locale} onChange={e=>setLocale(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {LOCALES.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            {style==='currency'?(
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {CURRENCIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ):(style==='decimal'?(
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
                <input type="number" min={0} max={10} value={decimals} onChange={e=>setDecimals(parseInt(e.target.value)||0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ):<div/>)}
          </div>
          {valid&&result&&(
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-brand-700">{result}</span>
              <button onClick={()=>copy(result)} className="text-sm px-3 py-1 bg-white border border-brand-200 rounded-lg">{copied===result?'\u2713':'Copy'}</button>
            </div>
          )}
        </div>
        {valid&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">All Locales</h2>
            <div className="space-y-2">
              {LOCALES.map(l=>{ const v=fmt(l.id,style,currency,decimals); return (
                <div key={l.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span className="text-sm text-gray-600">{l.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-800">{v}</span>
                    <button onClick={()=>copy(v)} className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded">{copied===v?'\u2713':'Copy'}</button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}