'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('interest-calculator')!
export default function InterestCalculatorPage() {
  const [mode,setMode]=useState<'simple'|'compound'>('compound')
  const [principal,setPrincipal]=useState(10000)
  const [rate,setRate]=useState(5)
  const [years,setYears]=useState(10)
  const [compFreq,setCompFreq]=useState(12)
  const simpleInterest=principal*rate/100*years
  const simpleTotal=principal+simpleInterest
  const compoundTotal=principal*Math.pow(1+rate/100/compFreq,compFreq*years)
  const compoundInterest=compoundTotal-principal
  const interest=mode==='simple'?simpleInterest:compoundInterest
  const total=mode==='simple'?simpleTotal:compoundTotal
  const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const schedule=Array.from({length:Math.min(years,20)},(_,i)=>{
    const y=i+1
    return{year:y,value:mode==='simple'?principal*(1+rate/100*y):principal*Math.pow(1+rate/100/compFreq,compFreq*y)}
  })
  const maxVal=Math.max(...schedule.map(s=>s.value))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('compound')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='compound'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Compound</button>
          <button onClick={()=>setMode('simple')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='simple'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Simple</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Principal ($)</label>
            <input type="number" value={principal} onChange={e=>setPrincipal(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2.5 text-lg font-mono text-center"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Annual rate (%)</label>
            <input type="number" value={rate} step="0.1" onChange={e=>setRate(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2.5 text-lg font-mono text-center"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Years</label>
            <input type="number" value={years} onChange={e=>setYears(Number(e.target.value))} min="1" max="50" className="w-full rounded border border-gray-300 px-3 py-2.5 text-lg font-mono text-center"/></div>
          {mode==='compound'&&<div><label className="block text-xs text-gray-500 mb-1">Compounding</label>
            <select value={compFreq} onChange={e=>setCompFreq(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-2.5">
              {[{l:'Annual (1x)',v:1},{l:'Quarterly (4x)',v:4},{l:'Monthly (12x)',v:12},{l:'Daily (365x)',v:365}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select></div>}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Principal','$'+fmt(principal),'text-gray-800'],['Interest','$'+fmt(interest),'text-blue-700'],['Total','$'+fmt(total),'text-green-700']].map(([l,v,c])=>(
            <div key={l} className="bg-gray-50 rounded-xl py-3">
              <p className={'text-lg font-bold font-mono '+c}>{v}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Growth chart</p>
          <div className="flex items-end gap-1 h-32">
            {schedule.map(s=>(
              <div key={s.year} className="flex-1 flex flex-col items-center gap-0.5 group">
                <div className="w-full rounded-t-sm bg-blue-500 transition-all" style={{height:(s.value/maxVal*100)+'%'}}/>
                <span className="text-xs text-gray-400">{s.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}