'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('age-calculator')!
export default function AgeCalculatorPage() {
  const [bday,setBday]=useState('1990-01-01')
  const [toDate,setToDate]=useState(new Date().toISOString().slice(0,10))
  const calc=()=>{
    const b=new Date(bday),t=new Date(toDate)
    if(isNaN(b.getTime())||isNaN(t.getTime())||b>t)return null
    let years=t.getFullYear()-b.getFullYear()
    let months=t.getMonth()-b.getMonth()
    let days=t.getDate()-b.getDate()
    if(days<0){months--;const prev=new Date(t.getFullYear(),t.getMonth(),0);days+=prev.getDate()}
    if(months<0){years--;months+=12}
    const totalDays=Math.floor((t.getTime()-b.getTime())/(1000*60*60*24))
    const totalWeeks=Math.floor(totalDays/7)
    const totalMonths=years*12+months
    const totalHours=totalDays*24
    const nextBday=new Date(t.getFullYear(),b.getMonth(),b.getDate())
    if(nextBday<=t)nextBday.setFullYear(t.getFullYear()+1)
    const daysToNext=Math.ceil((nextBday.getTime()-t.getTime())/(1000*60*60*24))
    return {years,months,days,totalDays,totalWeeks,totalMonths,totalHours,daysToNext,nextBday:nextBday.toLocaleDateString()}
  }
  const r=calc()
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" value={bday} onChange={e=>setBday(e.target.value)} max={toDate} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Calculate to</label>
            <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        {r&&<>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-center text-white">
            <p className="text-5xl font-bold">{r.years}</p>
            <p className="text-lg opacity-90 mt-1">Years Old</p>
            <p className="text-sm opacity-75 mt-1">{r.months} months, {r.days} days</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Total Days',r.totalDays.toLocaleString()],
              ['Total Weeks',r.totalWeeks.toLocaleString()],
              ['Total Months',r.totalMonths.toLocaleString()],
              ['Total Hours',r.totalHours.toLocaleString()],
            ].map(([l,v])=>(
              <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{l}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-sm text-amber-700">Next birthday in <strong>{r.daysToNext}</strong> days ({r.nextBday})</p>
          </div>
        </>}
      </div>
    </ToolLayout>
  )
}