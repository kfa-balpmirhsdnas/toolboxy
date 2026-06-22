'use client'
import { useState } from 'react'

const TIP_PRESETS=[10,15,18,20,25,30]

export default function TipCalculatorPage() {
  const [bill,setBill]=useState('50')
  const [tipPct,setTipPct]=useState(20)
  const [custom,setCustom]=useState('')
  const [people,setPeople]=useState('2')
  const [roundUp,setRoundUp]=useState(false)

  const billNum=parseFloat(bill)||0
  const activeTip=custom!==''?parseFloat(custom)||0:tipPct
  const tipAmt=billNum*activeTip/100
  const total=billNum+tipAmt
  const perPerson=parseFloat(people)>0?total/parseFloat(people):total
  const perPersonRounded=Math.ceil(perPerson*100)/100
  const displayed=roundUp?perPersonRounded:perPerson
  const fmt=(n:number)=>'$'+n.toFixed(2)

  const QUALITY=['Poor','Fair','Good','Great','Excellent']
  const qualityIdx=activeTip<=10?0:activeTip<=15?1:activeTip<=18?2:activeTip<=22?3:4

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tip Calculator</h1>
        <p className="text-gray-500 mb-8">Split the bill and calculate tip easily</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input type="number" value={bill} onChange={e=>setBill(e.target.value)} min={0}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Tip Percentage</label>
              <span className="text-sm text-gray-500">{QUALITY[qualityIdx]} service</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {TIP_PRESETS.map(t=>(
                <button key={t} onClick={()=>{setTipPct(t);setCustom('')}}
                  className={'px-3 py-1.5 rounded-lg text-sm font-bold transition-colors '+(activeTip===t&&custom===''?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                  {t}%
                </button>
              ))}
            </div>
            <input type="number" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Custom %"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
            <div className="flex items-center gap-3">
              <button onClick={()=>setPeople(p=>String(Math.max(1,parseInt(p)-1)))} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">-</button>
              <input type="number" value={people} onChange={e=>setPeople(e.target.value)} min={1}
                className="w-16 text-center border border-gray-300 rounded-lg py-1.5 font-mono focus:outline-none" />
              <button onClick={()=>setPeople(p=>String(parseInt(p)+1))} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">+</button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={roundUp} onChange={e=>setRoundUp(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">Round up per person</span>
          </label>
        </div>
        {billNum>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {[['Tip Amount',fmt(tipAmt)],['Total Bill',fmt(total)],['Per Person',fmt(displayed)]].map(([l,v],i)=>(
              <div key={l} className={'flex justify-between items-center px-5 py-3 '+(i<2?'border-b border-gray-100':'bg-brand-50')}>
                <span className={'text-gray-600 '+(i===2?'font-semibold text-gray-800':'')}>{l}</span>
                <span className={'font-mono font-bold '+(i===2?'text-brand-700 text-xl':'text-gray-900')}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}