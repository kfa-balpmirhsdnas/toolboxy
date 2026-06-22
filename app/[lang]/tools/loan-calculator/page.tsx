'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('loan-calculator')!

export default function LoanCalculatorPage() {
  const [principal,setPrincipal]=useState('200000')
  const [rate,setRate]=useState('6.5')
  const [years,setYears]=useState('30')
  const [showTable,setShowTable]=useState(false)

  const p=parseFloat(principal)||0
  const r=parseFloat(rate)/100/12
  const n=parseFloat(years)*12

  const monthly=useMemo(()=>{
    if(r===0) return p/n
    return p*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)
  },[p,r,n])

  const totalPaid=monthly*n
  const totalInterest=totalPaid-p
  const fmt=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})
  const fmtD=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2})

  const schedule=useMemo(()=>{
    if(!showTable||p===0||n===0) return[]
    const rows=[]
    let balance=p
    for(let i=1;i<=n;i++){
      const interest=balance*r
      const princ=monthly-interest
      balance-=princ
      if(i%12===0) rows.push({year:i/12,payment:monthly*12,interest:interest*12,principal:princ*12,balance:Math.max(0,balance)})
    }
    return rows
  },[showTable,p,r,n,monthly])

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate monthly payments, total interest, and amortization schedule</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {[['Loan Amount','$',principal,setPrincipal,'200000'],['Annual Interest Rate (%)',null,rate,setRate,'6.5'],['Loan Term (Years)',null,years,setYears,'30']].map(([l,pre,v,fn,ph])=>(
            <div key={l as string}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l as string}</label>
              <div className="relative">
                {pre&&<span className="absolute left-3 top-2.5 text-gray-500">{pre}</span>}
                <input type="number" value={v as string} onChange={e=>(fn as (s:string)=>void)(e.target.value)} placeholder={ph as string}
                  className={'w-full border border-gray-300 rounded-lg py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 '+(pre?'pl-7 pr-3':'px-3')} />
              </div>
            </div>
          ))}
        </div>
        {p>0&&n>0&&(
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[['Monthly Payment',fmtD(monthly),'text-brand-700','bg-brand-50'],['Total Paid',fmt(totalPaid),'text-gray-900','bg-white'],['Total Interest',fmt(totalInterest),'text-red-600','bg-red-50']].map(([l,v,tc,bg])=>(
                <div key={l as string} className={'rounded-xl border border-gray-200 p-3 text-center '+(bg as string)}>
                  <div className={'text-lg font-bold '+(tc as string)}>{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l as string}</div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Principal ({p>0?(p/totalPaid*100).toFixed(0):0}%)</span>
                <span>Interest ({p>0?(totalInterest/totalPaid*100).toFixed(0):0}%)</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full flex overflow-hidden">
                <div style={{width:(p/totalPaid*100)+'%'}} className="bg-brand-400" />
                <div className="flex-1 bg-red-300" />
              </div>
            </div>
            <button onClick={()=>setShowTable(s=>!s)} className="mt-3 w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl">
              {showTable?'Hide':'Show'} Amortization Schedule (by year)
            </button>
            {showTable&&schedule.length>0&&(
              <div className="mt-2 bg-white rounded-2xl border border-gray-200 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50"><tr>{['Year','Payment','Principal','Interest','Balance'].map(h=><th key={h} className="px-3 py-2 text-left text-gray-500">{h}</th>)}</tr></thead>
                  <tbody>
                    {schedule.map(r=>(
                      <tr key={r.year} className="border-t border-gray-50">
                        <td className="px-3 py-1.5 font-medium">{r.year}</td>
                        <td className="px-3 py-1.5">{fmtD(r.payment)}</td>
                        <td className="px-3 py-1.5 text-brand-600">{fmtD(r.principal)}</td>
                        <td className="px-3 py-1.5 text-red-500">{fmtD(r.interest)}</td>
                        <td className="px-3 py-1.5 text-gray-500">{fmt(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}