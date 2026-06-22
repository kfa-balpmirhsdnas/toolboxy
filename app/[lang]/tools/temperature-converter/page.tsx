'use client'
import { useState } from 'react'

type TUnit='C'|'F'|'K'|'R'

const UNITS:TUnit[]=['C','F','K','R']
const NAMES:Record<TUnit,string>={C:'Celsius',F:'Fahrenheit',K:'Kelvin',R:'Rankine'}

function toC(val:number,from:TUnit):number{
  if(from==='C') return val
  if(from==='F') return(val-32)*5/9
  if(from==='K') return val-273.15
  return(val-491.67)*5/9 // Rankine
}
function fromC(c:number,to:TUnit):number{
  if(to==='C') return c
  if(to==='F') return c*9/5+32
  if(to==='K') return c+273.15
  return(c+273.15)*9/5 // Rankine
}

const REFS=[
  {label:'Absolute Zero',C:-273.15},{label:'Freezing Point',C:0},
  {label:'Room Temp',C:20},{label:'Body Temp',C:37},
  {label:'Boiling Point',C:100},{label:'Oven (180\u00B0C)',C:180},
]

export default function TemperatureConverterPage() {
  const [val,setVal]=useState('100')
  const [from,setFrom]=useState<TUnit>('C')

  const c=toC(parseFloat(val)||0,from)
  const conversions=UNITS.map(u=>({unit:u,name:NAMES[u],value:fromC(c,u)}))

  function fmt(n:number):string{return isNaN(n)?'—':parseFloat(n.toFixed(4)).toString()}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Temperature Converter</h1>
        <p className="text-gray-500 mb-8">Convert between Celsius, Fahrenheit, Kelvin, and Rankine</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            {UNITS.map(u=>(
              <button key={u} onClick={()=>setFrom(u)} className={'flex-1 py-2 rounded-lg font-bold transition-colors '+(from===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>\u00B0{u}</button>
            ))}
          </div>
          <input type="number" value={val} onChange={e=>setVal(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="space-y-2">
            {conversions.map(c=>(
              <div key={c.unit} className={'flex justify-between items-center px-4 py-3 rounded-xl '+(c.unit===from?'bg-brand-50 border border-brand-200':'bg-gray-50')}>
                <span className="text-sm text-gray-600">{c.name}</span>
                <span className="font-mono font-bold text-gray-900">{fmt(c.value)} \u00B0{c.unit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Common Reference Points</h2>
          <div className="grid grid-cols-2 gap-2">
            {REFS.map(r=>(
              <button key={r.label} onClick={()=>{setVal(String(fromC(r.C,from)));}}
                className="text-left bg-gray-50 hover:bg-brand-50 rounded-xl p-3 transition-colors">
                <div className="text-xs font-medium text-gray-500">{r.label}</div>
                <div className="font-mono text-sm text-gray-900">{fmt(fromC(r.C,from))}\u00B0{from}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}