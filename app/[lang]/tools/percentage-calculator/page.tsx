'use client'
import { useState } from 'react'

type Mode = 'of'|'what'|'change'|'inc'|'dec'
const modes: {id:Mode; label:string; aLabel:string; bLabel:string}[] = [
  {id:'of',   label:'X% of Y',         aLabel:'Percentage (%)', bLabel:'Value (Y)'},
  {id:'what', label:'X is ?% of Y',    aLabel:'Value (X)',      bLabel:'Total (Y)'},
  {id:'change',label:'% Change',       aLabel:'From (X)',       bLabel:'To (Y)'},
  {id:'inc',  label:'Increase by %',   aLabel:'Original Value', bLabel:'Increase (%)'},
  {id:'dec',  label:'Decrease by %',   aLabel:'Original Value', bLabel:'Decrease (%)'},
]

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<Mode>('of')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState<string|null>(null)

  function calculate() {
    const x=parseFloat(a), y=parseFloat(b)
    if (isNaN(x)||isNaN(y)) return
    let r: number
    if (mode==='of') r=(x/100)*y
    else if (mode==='what') r=(x/y)*100
    else if (mode==='change') r=((y-x)/Math.abs(x))*100
    else if (mode==='inc') r=x*(1+y/100)
    else r=x*(1-y/100)
    const fmt = (n:number) => (Number.isInteger(n)?n:parseFloat(n.toFixed(6))).toLocaleString()
    const suffix = (mode==='what'||mode==='change') ? '%' : ''
    const prefix = (mode==='change' && r>0) ? '+' : ''
    setResult(prefix + fmt(r) + suffix)
  }

  const m = modes.find(x=>x.id===mode)!

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Percentage Calculator</h1>
        <p className="text-gray-500 mb-6">Calculate percentages in five different modes</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {modes.map(md => (
            <button key={md.id} onClick={()=>{setMode(md.id);setResult(null)}}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors '+(mode===md.id?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50')}>
              {md.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{m.aLabel}</label>
              <input type="number" value={a} onChange={e=>setA(e.target.value)} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{m.bLabel}</label>
              <input type="number" value={b} onChange={e=>setB(e.target.value)} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <button onClick={calculate} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Calculate</button>
          {result !== null && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 text-center">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Result</div>
              <div className="text-4xl font-bold text-brand-600">{result}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}