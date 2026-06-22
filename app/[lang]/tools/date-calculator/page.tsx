'use client'
import { useState } from 'react'

function daysBetween(a:Date,b:Date):number{return Math.abs(Math.floor((b.getTime()-a.getTime())/86400000))}
function addDays(d:Date,n:number):Date{const r=new Date(d);r.setDate(r.getDate()+n);return r}
function fmtDate(d:Date):string{return d.toLocaleDateString('en-US',{weekday:'short',year:'numeric',month:'long',day:'numeric'})}

export default function DateCalculatorPage() {
  const [mode,setMode]=useState<'diff'|'add'>('diff')
  const [d1,setD1]=useState('')
  const [d2,setD2]=useState('')
  const [days,setDays]=useState('')
  const [sign,setSign]=useState<1|-1>(1)

  const date1=d1?new Date(d1):null
  const date2=d2?new Date(d2):null
  const diffDays=date1&&date2?daysBetween(date1,date2):null
  const diffWeeks=diffDays!==null?Math.floor(diffDays/7):null
  const diffMonths=date1&&date2?Math.abs((date2.getFullYear()-date1.getFullYear())*12+(date2.getMonth()-date1.getMonth())):null
  const diffYears=date1&&date2?Math.abs(date2.getFullYear()-date1.getFullYear()):null

  const baseDate=d1?new Date(d1):null
  const daysNum=parseInt(days)
  const resultDate=baseDate&&!isNaN(daysNum)?addDays(baseDate,daysNum*sign):null

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Date Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate days between two dates or add/subtract days from a date</p>
        <div className="flex gap-2 mb-6">
          {([['diff','Date Difference'],['add','Add/Subtract Days']] as const).map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)} className={'px-4 py-2 rounded-lg font-medium transition-colors '+(mode===m?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>{l}</button>
          ))}
        </div>
        {mode==='diff'?(
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={d1} onChange={e=>setD1(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={d2} onChange={e=>setD2(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            {diffDays!==null&&(
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {([['Days',diffDays],['Weeks',diffWeeks!],['Months',diffMonths!],['Years',diffYears!]] as [string,number][]).map(([l,v])=>(
                  <div key={l} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-brand-600">{v.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ):(
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Date</label>
              <input type="date" value={d1} onChange={e=>setD1(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
                <div className="flex gap-1">
                  {([1,'-1'] as any[]).map((v,i)=>(
                    <button key={i} onClick={()=>setSign(v===1?1:-1)}
                      className={'px-4 py-2 rounded-lg font-bold text-lg transition-colors '+(sign===(v===1?1:-1)?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                      {v===1?'+':'\u2212'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
                <input type="number" value={days} onChange={e=>setDays(e.target.value)} placeholder="e.g. 30" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            {resultDate&&(
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">{sign>0?'After':'Before'} {days} day{days!=='1'?'s':''}</div>
                <div className="text-xl font-bold text-brand-700">{fmtDate(resultDate)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}