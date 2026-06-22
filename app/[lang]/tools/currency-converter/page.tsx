'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('currency-converter')!
const RATES:Record<string,number>={USD:1,EUR:0.9189,GBP:0.7892,JPY:154.32,KRW:1352.4,CNY:7.2431,AUD:1.5423,CAD:1.3642,CHF:0.8912,INR:83.41,MXN:17.23,BRL:5.031,SGD:1.3421,HKD:7.813,NOK:10.52,SEK:10.41,DKK:6.852,NZD:1.638,ZAR:18.54,AED:3.672}
const FLAGS:Record<string,string>={USD:'US',EUR:'EU',GBP:'GB',JPY:'JP',KRW:'KR',CNY:'CN',AUD:'AU',CAD:'CA',CHF:'CH',INR:'IN',MXN:'MX',BRL:'BR',SGD:'SG',HKD:'HK',NOK:'NO',SEK:'SE',DKK:'DK',NZD:'NZ',ZAR:'ZA',AED:'AE'}
const NAMES:Record<string,string>={USD:'US Dollar',EUR:'Euro',GBP:'British Pound',JPY:'Japanese Yen',KRW:'Korean Won',CNY:'Chinese Yuan',AUD:'Australian Dollar',CAD:'Canadian Dollar',CHF:'Swiss Franc',INR:'Indian Rupee',MXN:'Mexican Peso',BRL:'Brazilian Real',SGD:'Singapore Dollar',HKD:'Hong Kong Dollar',NOK:'Norwegian Krone',SEK:'Swedish Krona',DKK:'Danish Krone',NZD:'New Zealand Dollar',ZAR:'South African Rand',AED:'UAE Dirham'}
export default function CurrencyConverterPage() {
  const [from,setFrom]=useState('USD')
  const [to,setTo]=useState('KRW')
  const [amount,setAmount]=useState('100')
  const amt=parseFloat(amount)||0
  const converted=amt/RATES[from]*RATES[to]
  const rate=1/RATES[from]*RATES[to]
  const swap=()=>{setFrom(to);setTo(from)}
  const POPULAR=[['USD','KRW'],['USD','EUR'],['USD','JPY'],['EUR','GBP'],['USD','CNY']]
  const Sel=({val,set}:{val:string;set:(v:string)=>void})=>(
    <select value={val} onChange={e=>set(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
      {Object.keys(RATES).map(c=><option key={c} value={c}>{c} — {NAMES[c]}</option>)}
    </select>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">From</label><Sel val={from} set={setFrom}/></div>
          <button onClick={swap} className="mb-0.5 p-2 rounded-full border border-gray-300 hover:bg-gray-50 text-lg">⇄</button>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">To</label><Sel val={to} set={setTo}/></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount ({from})</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-3 text-2xl font-mono"/></div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center">
          <p className="text-sm opacity-80">{amount||'0'} {from} =</p>
          <p className="text-4xl font-bold mt-1">{converted.toLocaleString('en',{maximumFractionDigits:2})}</p>
          <p className="text-lg opacity-90 mt-0.5">{to}</p>
          <p className="text-xs opacity-60 mt-2">1 {from} = {rate.toFixed(4)} {to}</p>
        </div>
        <p className="text-xs text-gray-400 text-center">Rates are approximate and updated periodically. For exact rates, consult your bank.</p>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Popular pairs</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map(([f,t])=>(
              <button key={f+t} onClick={()=>{setFrom(f);setTo(t)}}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{f}/{t}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}