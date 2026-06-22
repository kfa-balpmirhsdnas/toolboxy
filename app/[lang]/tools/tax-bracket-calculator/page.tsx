'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

type FilingStatus = 'single'|'married'|'hoh'

// 2024 US Federal Tax Brackets
const BRACKETS:{status:FilingStatus,rates:{rate:number,min:number,max:number}[]}[]=[
  {status:'single',rates:[
    {rate:0.10,min:0,max:11600},{rate:0.12,min:11600,max:47150},{rate:0.22,min:47150,max:100525},
    {rate:0.24,min:100525,max:191950},{rate:0.32,min:191950,max:243725},{rate:0.35,min:243725,max:609350},{rate:0.37,min:609350,max:Infinity}
  ]},
  {status:'married',rates:[
    {rate:0.10,min:0,max:23200},{rate:0.12,min:23200,max:94300},{rate:0.22,min:94300,max:201050},
    {rate:0.24,min:201050,max:383900},{rate:0.32,min:383900,max:487450},{rate:0.35,min:487450,max:731200},{rate:0.37,min:731200,max:Infinity}
  ]},
  {status:'hoh',rates:[
    {rate:0.10,min:0,max:16550},{rate:0.12,min:16550,max:63100},{rate:0.22,min:63100,max:100500},
    {rate:0.24,min:100500,max:191950},{rate:0.32,min:191950,max:243700},{rate:0.35,min:243700,max:609350},{rate:0.37,min:609350,max:Infinity}
  ]},
]

function calcTax(income:number,status:FilingStatus):{bracket:number;taxable:number;tax:number}[]{
  const rates=BRACKETS.find(b=>b.status===status)!.rates
  return rates.map(r=>({
    bracket:r.rate,
    taxable:Math.max(0,Math.min(income,r.max)-r.min),
    tax:Math.max(0,Math.min(income,r.max)-r.min)*r.rate
  })).filter(x=>x.taxable>0)
}

const fmt=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})
const fmtPct=(n:number)=>n.toFixed(1)+'%'


const tool = getToolBySlug('tax-bracket-calculator')!

export default function TaxBracketCalculatorPage() {
  const [income,setIncome]=useState('75000')
  const [status,setStatus]=useState<FilingStatus>('single')

  const incomeNum=parseFloat(income.replace(/,/g,''))||0
  const brackets=calcTax(incomeNum,status)
  const totalTax=brackets.reduce((s,b)=>s+b.tax,0)
  const effectiveRate=incomeNum>0?totalTax/incomeNum*100:0
  const marginalRate=brackets.length>0?brackets[brackets.length-1].bracket*100:0
  const afterTax=incomeNum-totalTax

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Bracket Calculator</h1>
        <p className="text-gray-500 mb-8">2024 US Federal income tax breakdown by bracket (for reference only)</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Taxable Income</label>
            <input type="text" value={income} onChange={e=>setIncome(e.target.value.replace(/[^0-9]/g,''))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filing Status</label>
            <div className="flex gap-2">
              {([['single','Single'],['married','Married Filing Jointly'],['hoh','Head of Household']] as [FilingStatus,string][]).map(([s,l])=>(
                <button key={s} onClick={()=>setStatus(s)} className={'flex-1 py-2 text-sm rounded-lg font-medium transition-colors '+(status===s?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        {incomeNum>0&&brackets.length>0&&(
          <>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[['Total Tax',fmt(totalTax)],['Effective Rate',fmtPct(effectiveRate)],['Marginal Rate',fmtPct(marginalRate)],['After-Tax',fmt(afterTax)]].map(([l,v])=>(
                <div key={l} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                  <div className="text-xl font-bold text-brand-600">{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Bracket','Taxable Amount','Tax','% of Total'].map(h=><th key={h} className="px-4 py-2 text-left text-gray-500 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {brackets.map(b=>(
                    <tr key={b.bracket} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2 font-bold text-gray-700">{(b.bracket*100).toFixed(0)}%</td>
                      <td className="px-4 py-2">{fmt(b.taxable)}</td>
                      <td className="px-4 py-2 text-red-600 font-medium">{fmt(b.tax)}</td>
                      <td className="px-4 py-2 text-gray-400">{totalTax>0?(b.tax/totalTax*100).toFixed(1)+'%':'—'}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2">{fmt(incomeNum)}</td>
                    <td className="px-4 py-2 text-red-600">{fmt(totalTax)}</td>
                    <td className="px-4 py-2">{fmtPct(effectiveRate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">For educational purposes only. Consult a tax professional for accurate advice.</p>
          </>
        )}
      </div>
    </ToolLayout>
  )
}