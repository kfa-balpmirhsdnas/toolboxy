'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('loan-calculator')!

export default function LoanCalculatorPage({ params }: { params: { lang: string } }) {
  const [principal, setPrincipal] = useState('200000')
  const [rate, setRate] = useState('5')
  const [years, setYears] = useState('30')
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('loan-calculator'); tracked.current = true } }

  const P = parseFloat(principal)||0
  const r = parseFloat(rate)/100/12
  const n = parseFloat(years)*12
  let monthly = 0, totalPayment = 0, totalInterest = 0
  if (P>0 && r>0 && n>0) {
    monthly = P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)
    totalPayment = monthly*n
    totalInterest = totalPayment-P
  }

  const fmt = (v:number) => '$'+Math.round(v).toLocaleString()
  const interestPct = totalPayment>0?Math.round(totalInterest/totalPayment*100):0

  // Schedule preview (first 12 months)
  const schedule: {month:number;payment:number;principal:number;interest:number;balance:number}[] = []
  if (monthly>0) {
    let balance = P
    for (let m=1;m<=Math.min(12,n);m++) {
      const iPayment = balance*r
      const pPayment = monthly-iPayment
      balance -= pPayment
      schedule.push({month:m,payment:monthly,principal:pPayment,interest:iPayment,balance:Math.max(0,balance)})
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {label:'Loan Amount ($)',value:principal,set:setPrincipal,placeholder:'200000',step:'1000'},
            {label:'Annual Rate (%)',value:rate,set:setRate,placeholder:'5',step:'0.1'},
            {label:'Loan Term (years)',value:years,set:setYears,placeholder:'30',step:'1'},
          ].map(f=>(
            <div key={f.label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input type="number" value={f.value} onChange={e=>{f.set(e.target.value);track()}} placeholder={f.placeholder} step={f.step} min="0"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
        </div>
        {monthly>0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {label:'Monthly Payment',value:fmt(monthly),highlight:true},
                {label:'Total Payment',value:fmt(totalPayment)},
                {label:'Total Interest',value:fmt(totalInterest)},
                {label:'Interest %',value:interestPct+'%'},
              ].map(row=>(
                <div key={row.label} className={'p-3 rounded-xl border ' + (row.highlight?'bg-brand-50 border-brand-200':'bg-gray-50 border-gray-200')}>
                  <p className="text-xs text-gray-500">{row.label}</p>
                  <p className={'font-bold font-mono text-lg ' + (row.highlight?'text-brand-700':'text-gray-800')}>{row.value}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{width:(100-interestPct)+'%'}} />
              </div>
              <div className="flex text-xs text-gray-500 justify-between mt-0.5">
                <span className="text-brand-600 font-medium">Principal {100-interestPct}%</span>
                <span>Interest {interestPct}%</span>
              </div>
            </div>
            <details>
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">📋 Amortization schedule (first 12 months)</summary>
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
                  <span>#</span><span>Payment</span><span>Principal</span><span>Interest</span><span>Balance</span>
                </div>
                {schedule.map(s=>(
                  <div key={s.month} className="grid grid-cols-5 px-3 py-1 text-xs font-mono border-b border-gray-50 text-gray-700">
                    <span>{s.month}</span>
                    <span>{fmt(s.payment)}</span>
                    <span className="text-brand-600">{fmt(s.principal)}</span>
                    <span className="text-red-500">{fmt(s.interest)}</span>
                    <span>{fmt(s.balance)}</span>
                  </div>
                ))}
              </div>
            </details>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
