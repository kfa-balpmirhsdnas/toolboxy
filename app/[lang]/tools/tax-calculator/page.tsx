'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('tax-calculator')!
const PRESETS=[{label:'US 10%',rate:10},{label:'UK VAT 20%',rate:20},{label:'EU VAT 21%',rate:21},{label:'Canada 5%',rate:5},{label:'AU GST 10%',rate:10},{label:'Japan 10%',rate:10},{label:'Korea 10%',rate:10}]
function fmt(n:number):string{return '$'+n.toFixed(2)}
export default function TaxCalculatorPage() {
  const [amount,setAmount]=useState('100')
  const [rate,setRate]=useState(10)
  const [mode,setMode]=useState<'excl'|'incl'>('excl')
  const val=parseFloat(amount)||0
  const taxAmt=mode==='excl'?val*rate/100:val-(val/(1+rate/100))
  const pretax=mode==='excl'?val:val-taxAmt
  const total=mode==='excl'?val+taxAmt:val
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('excl')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='excl'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Tax Exclusive</button>
          <button onClick={()=>setMode('incl')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='incl'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Tax Inclusive</button>
        </div>
        <p className="text-xs text-gray-500 text-center">{mode==='excl'?'Enter price before tax':'Enter price including tax — tax portion extracted'}</p>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-3 text-2xl font-mono"/></div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Tax rate</label>
            <span className="text-blue-600 font-bold">{rate}%</span>
          </div>
          <input type="range" min="0" max="50" step="0.5" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mb-2"/>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p=>(
              <button key={p.label} onClick={()=>setRate(p.rate)}
                className={'px-2.5 py-1 rounded-full border text-xs transition '+(rate===p.rate?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50')}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-600">Pre-tax amount</span>
            <span className="font-semibold text-gray-800">{fmt(pretax)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 bg-amber-50">
            <span className="text-amber-700">Tax ({rate}%)</span>
            <span className="font-semibold text-amber-700">{fmt(taxAmt)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 bg-blue-50">
            <span className="font-bold text-blue-800">Total</span>
            <span className="font-bold text-blue-800 text-lg">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}