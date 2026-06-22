'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('date-difference-calculator')!
export default function DateDifferenceCalculatorPage() {
  const [from,setFrom]=useState(()=>new Date(Date.now()-30*86400000).toISOString().slice(0,10))
  const [to,setTo]=useState(()=>new Date().toISOString().slice(0,10))
  const [mode,setMode]=useState<'diff'|'add'>('diff')
  const [addDays,setAddDays]=useState(30)
  const d1=new Date(from),d2=new Date(to)
  const diffMs=d2.getTime()-d1.getTime()
  const totalDays=Math.round(diffMs/86400000)
  const weeks=Math.floor(Math.abs(totalDays)/7)
  const remDays=Math.abs(totalDays)%7
  const months=Math.abs(d2.getMonth()-d1.getMonth()+(d2.getFullYear()-d1.getFullYear())*12)
  const addResult=new Date(d1.getTime()+addDays*86400000).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
  const RANGES=[{label:'7 days',v:7},{label:'30 days',v:30},{label:'90 days',v:90},{label:'1 year',v:365}]
  const WORK_DAYS=()=>{
    let c=0,d=new Date(d1)
    while(d<=d2){if(d.getDay()!==0&&d.getDay()!==6)c++;d=new Date(d.getTime()+86400000)}
    return c
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('diff')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='diff'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Date Difference</button>
          <button onClick={()=>setMode('add')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='add'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Add Days to Date</button>
        </div>
        {mode==='diff'?(
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
                <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
                <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-blue-700">{Math.abs(totalDays)}</p>
                <p className="text-xs text-blue-500 mt-1">Total days {totalDays<0?'(past)':'(future)'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-700">{weeks}w {remDays}d</p>
                <p className="text-xs text-gray-500 mt-1">Weeks and days</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-700">~{months}</p>
                <p className="text-xs text-gray-500 mt-1">Months</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{WORK_DAYS()}</p>
                <p className="text-xs text-green-500 mt-1">Working days</p>
              </div>
            </div>
          </>
        ):(
          <>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Days to add: {addDays}</label>
              <input type="range" min="-365" max="365" value={addDays} onChange={e=>setAddDays(Number(e.target.value))} className="w-full"/>
              <input type="number" value={addDays} onChange={e=>setAddDays(Number(e.target.value))} className="w-full mt-1 rounded border border-gray-300 px-3 py-2 text-center font-mono"/>
            </div>
            <div className="flex flex-wrap gap-2">
              {RANGES.map(r=>(
                <button key={r.v} onClick={()=>setAddDays(r.v)} className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{r.label}</button>
              ))}
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <p className="text-xs text-purple-500">Result date</p>
              <p className="text-lg font-bold text-purple-800 mt-1">{addResult}</p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}