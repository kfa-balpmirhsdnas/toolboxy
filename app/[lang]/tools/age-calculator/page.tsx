'use client'
import { useState, useEffect } from 'react'

export default function AgeCalculatorPage() {
  const [dob,setDob]=useState('1990-01-01')
  const [toDate,setToDate]=useState(new Date().toISOString().slice(0,10))
  const [now,setNow]=useState(new Date())

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[]) 

  const birth=new Date(dob)
  const target=new Date(toDate)
  const diff=target.getTime()-birth.getTime()

  let years=0,months=0,days=0
  if(!isNaN(diff)&&diff>=0){
    let y=target.getFullYear()-birth.getFullYear()
    let m=target.getMonth()-birth.getMonth()
    let d=target.getDate()-birth.getDate()
    if(d<0){m--;const prev=new Date(target.getFullYear(),target.getMonth(),0);d+=prev.getDate()}
    if(m<0){y--;m+=12}
    years=y;months=m;days=d
  }

  const totalDays=Math.floor(diff/(1000*60*60*24))
  const totalWeeks=Math.floor(totalDays/7)
  const totalMonths=years*12+months
  const totalHours=Math.floor(diff/(1000*60*60))

  // Next birthday
  const thisYear=new Date(target.getFullYear(),birth.getMonth(),birth.getDate())
  const nextBday=thisYear<=target?new Date(target.getFullYear()+1,birth.getMonth(),birth.getDate()):thisYear
  const daysToNext=Math.ceil((nextBday.getTime()-target.getTime())/(1000*60*60*24))

  const fmt=(n:number)=>n.toLocaleString()

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Age Calculator</h1>
        <p className="text-gray-500 mb-8">Find your exact age and time until your next birthday</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={dob} onChange={e=>setDob(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calculate To</label>
              <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          {diff>=0&&!isNaN(diff)&&(
            <>
              <div className="flex gap-4 justify-center pt-2">
                {[['Years',years],['Months',months],['Days',days]].map(([l,v])=>(
                  <div key={l as string} className="flex-1 text-center bg-brand-50 rounded-2xl p-4 border border-brand-100">
                    <div className="text-4xl font-black text-brand-700">{v}</div>
                    <div className="text-sm text-gray-500 mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[[`${fmt(totalMonths)} months total`,'Total Months'],[`${fmt(totalWeeks)} weeks`,'Total Weeks'],[`${fmt(totalDays)} days`,'Total Days'],[`${fmt(totalHours)} hours`,'Total Hours']].map(([v,l])=>(
                  <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="font-bold text-gray-900">{v}</div>
                    <div className="text-xs text-gray-500">{l}</div>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                <p className="text-sm text-yellow-800">\u{1F382} Next birthday in <strong>{daysToNext}</strong> day{daysToNext!==1?'s':''} ({nextBday.toLocaleDateString('en',{month:'long',day:'numeric'})})</p>
              </div>
            </>
          )}
          {diff<0&&dob&&<p className="text-red-500 text-sm">Date of birth must be before the target date.</p>}
        </div>
      </div>
    </main>
  )
}