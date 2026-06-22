'use client'
import { useState } from 'react'

const UNITS=[
  {id:'mps',label:'m/s',factor:1},
  {id:'kph',label:'km/h',factor:1/3.6},
  {id:'mph',label:'mph',factor:0.44704},
  {id:'fps',label:'ft/s',factor:0.3048},
  {id:'knot',label:'knots',factor:0.514444},
  {id:'mach',label:'Mach (air)',factor:340.29},
  {id:'light',label:'Speed of light',factor:299792458},
]

export default function SpeedConverterPage() {
  const [val,setVal]=useState('100')
  const [from,setFrom]=useState('kph')

  const base=parseFloat(val)*(UNITS.find(u=>u.id===from)?.factor??1)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Speed Converter</h1>
        <p className="text-gray-500 mb-8">Convert between m/s, km/h, mph, knots, Mach, and more</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="number" value={val} onChange={e=>setVal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={from} onChange={e=>setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 h-[42px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                {UNITS.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        {!isNaN(base)&&(
          <div className="mt-4 space-y-2">
            {UNITS.map(u=>{
              const converted=base/u.factor
              const display=converted>=0.001&&converted<1e12?parseFloat(converted.toPrecision(6)).toLocaleString('en-US',{maximumSignificantDigits:6}):converted.toExponential(4)
              return(
                <div key={u.id} className={'flex items-center justify-between px-4 py-3 rounded-xl border '+(u.id===from?'border-brand-300 bg-brand-50':'bg-white border-gray-200')}>
                  <span className="text-sm font-medium text-gray-600">{u.label}</span>
                  <span className="font-mono font-semibold text-gray-900">{display}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}