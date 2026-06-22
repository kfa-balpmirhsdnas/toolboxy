'use client'
import { useState } from 'react'

function fmt(n:number):string{return isNaN(n)||!isFinite(n)?'—':parseFloat(n.toFixed(4)).toLocaleString()}

export default function PercentageCalculatorPage() {
  const [a,setA]=useState('25')
  const [b,setB]=useState('200')
  const [whole,setWhole]=useState('500')
  const [part,setPart]=useState('75')
  const [from,setFrom]=useState('100')
  const [to,setTo]=useState('150')

  const r1=parseFloat(a)/100*parseFloat(b)
  const r2=parseFloat(part)/parseFloat(whole)*100
  const change=((parseFloat(to)-parseFloat(from))/parseFloat(from))*100
  const r3=parseFloat(b)-parseFloat(a)/100*parseFloat(b)
  const r4=parseFloat(b)*(1+parseFloat(a)/100)

  const Section=({title,children}:{title:string;children:React.ReactNode})=>(
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )

  const Row=({label,value}:{label:string;value:string})=>(
    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-xl font-bold text-brand-700 font-mono">{value}</span>
    </div>
  )

  const Input=({value,onChange,prefix,suffix}:{value:string;onChange:(v:string)=>void;prefix?:string;suffix?:string})=>(
    <div className="relative flex items-center">
      {prefix&&<span className="absolute left-3 text-gray-500">{prefix}</span>}
      <input type="number" value={value} onChange={e=>onChange(e.target.value)}
        className={'w-full border border-gray-300 rounded-lg py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 '+(prefix?'pl-7':'pl-3')+(suffix?' pr-7':' pr-3')} />
      {suffix&&<span className="absolute right-3 text-gray-500">{suffix}</span>}
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Percentage Calculator</h1>
        <p className="text-gray-500 mb-8">Four common percentage calculation modes</p>
        <div className="space-y-4">
          <Section title="What is X% of Y?">
            <div className="flex gap-2 items-center">
              <Input value={a} onChange={setA} suffix="%" />
              <span className="text-gray-400">of</span>
              <Input value={b} onChange={setB} />
            </div>
            <Row label="Result" value={fmt(r1)} />
          </Section>
          <Section title="X is what % of Y?">
            <div className="flex gap-2 items-center">
              <Input value={part} onChange={setPart} />
              <span className="text-gray-400">of</span>
              <Input value={whole} onChange={setWhole} />
            </div>
            <Row label="Percentage" value={fmt(r2)+'%'} />
          </Section>
          <Section title="Percentage Change">
            <div className="flex gap-2 items-center">
              <Input value={from} onChange={setFrom} />
              <span className="text-gray-400">\u2192</span>
              <Input value={to} onChange={setTo} />
            </div>
            <Row label={change>=0?'Increase':'Decrease'} value={(change>=0?'+':'')+fmt(change)+'%'} />
          </Section>
          <Section title="Discount & Markup">
            <div className="flex gap-2 items-center">
              <Input value={b} onChange={setB} prefix="$" />
              <span className="text-gray-400">\u00B1</span>
              <Input value={a} onChange={setA} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-50">
              <div className="text-center bg-red-50 rounded-xl p-3"><div className="text-xl font-bold text-red-600 font-mono">{fmt(r3)}</div><div className="text-xs text-gray-500">After discount</div></div>
              <div className="text-center bg-green-50 rounded-xl p-3"><div className="text-xl font-bold text-green-600 font-mono">{fmt(r4)}</div><div className="text-xs text-gray-500">After markup</div></div>
            </div>
          </Section>
        </div>
      </div>
    </main>
  )
}