'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('currency-converter')!

// Approximate rates as of mid-2025 (base: USD)
const RATES: Record<string,number> = {
  USD:1, EUR:0.92, GBP:0.79, JPY:157.5, KRW:1380, CNY:7.25, CAD:1.37, AUD:1.55,
  CHF:0.89, HKD:7.83, SGD:1.35, SEK:10.8, NOK:10.7, DKK:6.9, NZD:1.67,
  MXN:18.5, BRL:5.0, INR:83.5, RUB:89.0, TRY:32.5, ZAR:18.8, AED:3.67,
  SAR:3.75, THB:36.5, IDR:16200, MYR:4.7, PHP:58.0, CZK:23.5, PLN:4.05,
  HUF:370, RON:4.6, BGN:1.8, HRK:7.0, ILS:3.7, EGP:48.5, NGN:1500, PKR:278,
}

const COMMON = ['USD','EUR','GBP','JPY','KRW','CNY','CAD','AUD','CHF','HKD','SGD','INR']
const ALL = Object.keys(RATES).sort()

const FLAGS: Record<string,string> = {
  USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',JPY:'🇯🇵',KRW:'🇰🇷',CNY:'🇨🇳',CAD:'🇨🇦',AUD:'🇦🇺',CHF:'🇨🇭',HKD:'🇭🇰',SGD:'🇸🇬',
  SEK:'🇸🇪',NOK:'🇳🇴',DKK:'🇩🇰',NZD:'🇳🇿',MXN:'🇲🇽',BRL:'🇧🇷',INR:'🇮🇳',RUB:'🇷🇺',TRY:'🇹🇷',ZAR:'🇿🇦',AED:'🇦🇪',
  SAR:'🇸🇦',THB:'🇹🇭',IDR:'🇮🇩',MYR:'🇲🇾',PHP:'🇵🇭',CZK:'🇨🇿',PLN:'🇵🇱',HUF:'🇭🇺',RON:'🇷🇴',BGN:'🇧🇬',HRK:'🇭🇷',
  ILS:'🇮🇱',EGP:'🇪🇬',NGN:'🇳🇬',PKR:'🇵🇰',
}

function convert(amount: number, from: string, to: string): number {
  const inUSD = amount / (RATES[from]||1)
  return inUSD * (RATES[to]||1)
}

export default function CurrencyConverterPage({ params }: { params: { lang: string } }) {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('currency-converter'); tracked.current = true } }

  const num = parseFloat(amount)||0
  const result = convert(num, from, to)
  const rate = convert(1, from, to)
  const reverseRate = convert(1, to, from)

  async function copy() {
    await navigator.clipboard.writeText(`${num} ${from} = ${result.toFixed(4)} ${to}`)
    trackToolCopy('currency-converter'); setCopied(true); setTimeout(()=>setCopied(false),1500)
  }
  function swap() { const t=from; track(); /* React state batch */ setFrom(to); setTo(t) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="p-1.5 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-600 text-center">
          Approximate rates — for reference only. Not real-time data.
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
            <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);track()}} min="0" step="any"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <select value={from} onChange={e=>{setFrom(e.target.value);track()}}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                {ALL.map(c=><option key={c} value={c}>{FLAGS[c]||''} {c}</option>)}
              </select>
            </div>
            <button onClick={swap} className="mb-0.5 w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg flex items-center justify-center transition-colors">⇄</button>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <select value={to} onChange={e=>{setTo(e.target.value);track()}}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                {ALL.map(c=><option key={c} value={c}>{FLAGS[c]||''} {c}</option>)}
              </select>
            </div>
          </div>
        </div>
        {num>0 && (
          <div className="p-5 bg-gradient-to-br from-brand-50 to-purple-50 border border-brand-100 rounded-2xl">
            <p className="text-sm text-gray-500">{num.toLocaleString()} {from} =</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{result.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})} <span className="text-brand-600">{to}</span></p>
            <div className="mt-2 text-xs text-gray-400">
              <p>1 {from} = {rate.toFixed(4)} {to}</p>
              <p>1 {to} = {reverseRate.toFixed(4)} {from}</p>
            </div>
            <button onClick={copy} className="mt-2 text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy result'}</button>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Quick compare ({amount||1} {from})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {COMMON.filter(c=>c!==from).map(c=>(
              <div key={c} onClick={()=>{setTo(c);track()}}
                className={'p-2 rounded-lg border cursor-pointer transition-colors ' + (to===c?'border-brand-300 bg-brand-50':'border-gray-200 hover:border-gray-300 bg-gray-50')}>
                <span className="text-xs text-gray-400">{FLAGS[c]} {c}</span>
                <p className="text-sm font-mono font-semibold text-gray-700">{convert(num||1,from,c).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
