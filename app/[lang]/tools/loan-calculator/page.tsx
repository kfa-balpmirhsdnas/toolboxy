'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('loan-calculator')!
export default function LoanCalculatorPage() {
  const [principal,setPrincipal]=useState(250000)
  const [rate,setRate]=useState(6.5)
  const [years,setYears]=useState(30)
  const [showSchedule,setShowSchedule]=useState(false)
  const result=useMemo(()=>{
    const r=rate/100/12,n=years*12
    if(r===0)return{monthly:principal/n,total:principal,totalInterest:0,schedule:[]}
    const m=principal*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)
    const total=m*n,totalInterest=total-principal
    const schedule=[]
    let bal=principal
    for(let i=1;i<=Math.min(n,360);i++){
      const int=bal*r,prin=m-int
      bal=Math.max(0,bal-prin)
      schedule.push({month:i,payment:m,principal:prin,interest:int,balance:bal})
    }
    return{monthly:m,total,totalInterest,schedule}
  },[principal,rate,years])
  const fmt=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2})
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Loan Amount (USD)</label>
            <input type="number" value={principal} onChange={e=>setPrincipal(Number(e.target.value))} min="0"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xl text-center font-bold focus:outline-none focus:border-blue-400"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">Annual Interest Rate (%)</label>
              <input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} min="0" max="50" step="0.1"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Loan Term (years)</label>
              <input type="number" value={years} onChange={e=>setYears(Number(e.target.value))} min="1" max="50"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[[100000,5,15],[250000,6.5,30],[500000,7,30],[50000,8,10]].map(([p,r,y])=>(
            <button key={p+'-'+y} onClick={()=>{setPrincipal(p);setRate(r);setYears(y)}}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">
              {(p/1000).toFixed(0)}K @ {r}% / {y}yr
            </button>
          ))}
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-xs text-blue-600 font-medium mb-3">Monthly Payment</p>
          <p className="text-4xl font-bold text-blue-700 mb-4">{fmt(result.monthly)}</p>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {[['Principal',fmt(principal),'text-gray-800'],['Total Interest',fmt(result.totalInterest),'text-red-600'],['Total Cost',fmt(result.total),'text-gray-800']].map(([l,v,cls])=>(
              <div key={l} className="bg-white/70 rounded-xl py-2.5">
                <p className={'font-bold '+cls}>{v}</p><p className="text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-3 rounded-full overflow-hidden bg-blue-200">
            <div className="h-full bg-blue-600 rounded-full" style={{width:(principal/result.total*100)+'%'}}/>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-blue-700">Principal {Math.round(principal/result.total*100)}%</span>
            <span className="text-red-500">Interest {Math.round(result.totalInterest/result.total*100)}%</span>
          </div>
        </div>
        {result.schedule.length>0&&(
          <div>
            <button onClick={()=>setShowSchedule(s=>!s)} className="text-sm text-blue-600 hover:underline">
              {showSchedule?'Hide':'Show'} amortization schedule
            </button>
            {showSchedule&&(
              <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50"><tr>
                    {['Month','Payment','Principal','Interest','Balance'].map(h=><th key={h} className="px-2 py-2 text-left font-semibold text-gray-600">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {result.schedule.map((row,i)=>(
                      <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                        <td className="px-2 py-1.5">{row.month}</td>
                        <td className="px-2 py-1.5 font-mono">{fmt(row.payment)}</td>
                        <td className="px-2 py-1.5 font-mono text-blue-600">{fmt(row.principal)}</td>
                        <td className="px-2 py-1.5 font-mono text-red-500">{fmt(row.interest)}</td>
                        <td className="px-2 py-1.5 font-mono">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}