'use client'
import { useState } from 'react'

type Unit = 'C'|'F'|'K'
const UNITS: Unit[] = ['C','F','K']
const LABELS: Record<Unit,string> = {C:'Celsius',F:'Fahrenheit',K:'Kelvin'}
const SYMBOLS: Record<Unit,string> = {C:'\u00B0C',F:'\u00B0F',K:'K'}

function convert(val: number, from: Unit, to: Unit): number {
  if (from === to) return val
  let celsius: number
  if (from==='C') celsius=val
  else if (from==='F') celsius=(val-32)*5/9
  else celsius=val-273.15
  if (to==='C') return celsius
  if (to==='F') return celsius*9/5+32
  return celsius+273.15
}

const REFS = [
  {label:'Absolute Zero', C:-273.15},
  {label:'Water Freezing', C:0},
  {label:'Room Temp', C:22},
  {label:'Body Temp', C:37},
  {label:'Water Boiling', C:100},
]

export default function TemperatureConverterPage() {
  const [val, setVal] = useState('')
  const [from, setFrom] = useState<Unit>('C')

  const n = parseFloat(val)
  const valid = !isNaN(n)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Temperature Converter</h1>
        <p className="text-gray-500 mb-8">Convert between Celsius, Fahrenheit and Kelvin</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2 mb-2">
            {UNITS.map(u=>(
              <button key={u} onClick={()=>setFrom(u)}
                className={'px-4 py-2 rounded-lg font-medium transition-colors '+(from===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                {LABELS[u]}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature in {LABELS[from]}</label>
            <input type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder="Enter temperature"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {valid && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              {UNITS.map(u=>(
                <div key={u} className={'rounded-xl p-4 text-center '+(u===from?'bg-brand-50 border-2 border-brand-200':'bg-gray-50 border border-gray-100')}>
                  <div className={'text-2xl font-bold '+(u===from?'text-brand-600':'text-gray-800')}>
                    {convert(n,from,u).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{SYMBOLS[u]}</div>
                  <div className="text-xs text-gray-400">{LABELS[u]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Reference Points</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Reference</th>
                  <th className="text-right py-2 text-gray-500 font-medium">{SYMBOLS.C}</th>
                  <th className="text-right py-2 text-gray-500 font-medium">{SYMBOLS.F}</th>
                  <th className="text-right py-2 text-gray-500 font-medium">{SYMBOLS.K}</th>
                </tr>
              </thead>
              <tbody>
                {REFS.map(ref=>(
                  <tr key={ref.label} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-700">{ref.label}</td>
                    <td className="py-2 text-right font-mono text-gray-600">{ref.C.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-gray-600">{convert(ref.C,'C','F').toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-gray-600">{convert(ref.C,'C','K').toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}