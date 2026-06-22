'use client'
import { useState } from 'react'

const TIP_PRESETS = [10,15,18,20,25]

export default function TipCalculatorPage() {
  const [bill, setBill] = useState('')
  const [tipPct, setTipPct] = useState(18)
  const [people, setPeople] = useState(1)
  const [round, setRound] = useState(false)

  const billAmt = parseFloat(bill) || 0
  const tipAmt = billAmt * tipPct / 100
  const total = billAmt + tipAmt
  const perPerson = people > 1 ? total / people : total
  const tipPerPerson = people > 1 ? tipAmt / people : tipAmt
  const fmt = (n:number) => '$'+(round?Math.round(n):n.toFixed(2))

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tip Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate tip amount and split the bill between multiple people</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input type="number" value={bill} onChange={e=>setBill(e.target.value)} placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Tip Percentage</label>
              <span className="text-brand-600 font-bold text-lg">{tipPct}%</span>
            </div>
            <input type="range" min={0} max={50} value={tipPct} onChange={e=>setTipPct(parseInt(e.target.value))}
              className="w-full" />
            <div className="flex gap-2 mt-2">
              {TIP_PRESETS.map(p=>(
                <button key={p} onClick={()=>setTipPct(p)}
                  className={'flex-1 py-1 rounded-lg text-sm font-medium transition-colors '+(tipPct===p?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
              <input type="number" min={1} max={100} value={people} onChange={e=>setPeople(Math.max(1,parseInt(e.target.value)||1))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={round} onChange={e=>setRound(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Round amounts</span>
              </label>
            </div>
          </div>
        </div>
        {billAmt > 0 && (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-gray-800">{fmt(tipAmt)}</div>
                <div className="text-xs text-gray-500 mt-1">Tip Amount</div>
              </div>
              <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-brand-600">{fmt(total)}</div>
                <div className="text-xs text-gray-500 mt-1">Total</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-gray-800">{fmt(billAmt)}</div>
                <div className="text-xs text-gray-500 mt-1">Bill</div>
              </div>
            </div>
            {people > 1 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">{fmt(perPerson)}</div>
                  <div className="text-sm text-green-600 mt-1">Per person ({people} people)</div>
                  <div className="text-sm text-gray-500 mt-1">{fmt(billAmt/people)} + {fmt(tipPerPerson)} tip</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}