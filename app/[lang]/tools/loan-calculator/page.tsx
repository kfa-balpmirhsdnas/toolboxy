'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('loan-calculator')!
export default function LoanCalculatorPage() {
  const [principal,setPrincipal]=useState('300000')
  const [rate,setRate]=useState('6.5')
  const [years,setYears]=useState('30')
  const p=parseFloat(principal),r=parseFloat(rate)/100/12,n=parseFloat(years)*12
  const monthly=p&&r&&n?r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):0
  const totalPay=monthly*n
  const totalInterest=totalPay-p
  const fmt=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2})
  const schedule=[]
  if(p&&r&&n&&monthly){
    let bal=p
    for(let i=1;i<=Math.min(n,360);i++){
      const int=bal*r,prin=monthly-int;bal-=prin
      schedule.push({month:i,payment:monthly,interest:int,principal:prin,balance:Math.max(0,bal)})
    }
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Loan Amount ($)</label>
            <input type="number" value={principal} onChange={e=>setPrincipal(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Annual Rate (%)</label>
            <input type="number" value={rate} step="0.1" onChange={e=>setRate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Term (years)</label>
            <input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        {monthly>0&&(
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-500 font-medium">Monthly Payment</p>
                <p className="text-xl font-bold text-blue-700 mt-1">{fmt(monthly)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-amber-600 font-medium">Total Interest</p>
                <p className="text-xl font-bold text-amber-700 mt-1">{fmt(totalInterest)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium">Total Payment</p>
                <p className="text-xl font-bold text-gray-700 mt-1">{fmt(totalPay)}</p>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>{['Mo','Payment','Interest','Principal','Balance'].map(h=><th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedule.map(r=>(
                    <tr key={r.month} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 text-gray-500">{r.month}</td>
                      <td className="px-3 py-1.5 font-mono">{fmt(r.payment)}</td>
                      <td className="px-3 py-1.5 font-mono text-amber-600">{fmt(r.interest)}</td>
                      <td className="px-3 py-1.5 font-mono text-green-600">{fmt(r.principal)}</td>
                      <td className="px-3 py-1.5 font-mono">{fmt(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}