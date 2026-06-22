'use client'
import { useState } from 'react'

export default function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('')
  const [years, setYears] = useState('')
  const [result, setResult] = useState<{monthly:number;total:number;interest:number}|null>(null)

  function calculate() {
    const p=parseFloat(principal), r=parseFloat(rate)/100/12, n=parseInt(years)*12
    if(!p||!r||!n||p<=0||r<=0||n<=0){setResult(null);return}
    const monthly = p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)
    const total = monthly*n
    setResult({monthly, total, interest:total-p})
  }

  const fmt=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2})

  // Amortization for chart
  const p=parseFloat(principal)||0,r=parseFloat(rate)/100/12,n=parseInt(years)*12||0
  const monthly = (p&&r&&n) ? p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1) : 0
  const schedule: {year:number;balance:number;paid:number}[]=[]
  if(monthly>0){
    let bal=p
    for(let m=1;m<=n;m++){
      const int=bal*r
      const prin=monthly-int
      bal=Math.max(0,bal-prin)
      if(m%12===0) schedule.push({year:m/12,balance:bal,paid:monthly*m})
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate monthly payments, total interest and amortization for any loan</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($)</label>
              <input type="number" value={principal} onChange={e=>setPrincipal(e.target.value)} placeholder="e.g. 200000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rate (%)</label>
              <input type="number" step="0.01" value={rate} onChange={e=>setRate(e.target.value)} placeholder="e.g. 6.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (years)</label>
              <input type="number" value={years} onChange={e=>setYears(e.target.value)} placeholder="e.g. 30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <button onClick={calculate} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Calculate</button>
        </div>
        {result && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-brand-600">{fmt(result.monthly)}</div>
                <div className="text-xs text-gray-500 mt-1">Monthly Payment</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">{fmt(result.total)}</div>
                <div className="text-xs text-gray-500 mt-1">Total Payment</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{fmt(result.interest)}</div>
                <div className="text-xs text-gray-500 mt-1">Total Interest</div>
              </div>
            </div>
            {schedule.length>0&&(
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h2 className="font-semibold text-gray-700 mb-3">Yearly Balance</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left py-1 text-gray-500">Year</th><th className="text-right py-1 text-gray-500">Balance</th><th className="text-right py-1 text-gray-500">Paid</th></tr></thead>
                    <tbody>
                      {schedule.filter((_,i)=>i%Math.max(1,Math.floor(schedule.length/10))===0||i===schedule.length-1).map(s=>(
                        <tr key={s.year} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-1.5">{s.year}</td>
                          <td className="py-1.5 text-right font-mono">{fmt(s.balance)}</td>
                          <td className="py-1.5 text-right font-mono">{fmt(s.paid)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}