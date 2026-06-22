'use client'
import { useState } from 'react'

const DICE = [4,6,8,10,12,20]

export default function DiceRollerPage() {
  const [sides, setSides] = useState(6)
  const [count, setCount] = useState(1)
  const [results, setResults] = useState<number[]>([])
  const [modifier, setModifier] = useState(0)
  const [rolling, setRolling] = useState(false)

  function roll() {
    setRolling(true)
    setTimeout(() => {
      const rolls = Array.from({length:count}, () => Math.floor(Math.random()*sides)+1)
      setResults(rolls)
      setRolling(false)
    }, 400)
  }

  const total = results.reduce((a,b)=>a+b,0) + modifier
  const sum = results.reduce((a,b)=>a+b,0)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dice Roller</h1>
        <p className="text-gray-500 mb-8">Roll any standard RPG dice — d4, d6, d8, d10, d12, d20</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Die Type</label>
            <div className="flex flex-wrap gap-2">
              {DICE.map(d=>(
                <button key={d} onClick={()=>setSides(d)}
                  className={'px-4 py-2 rounded-xl font-bold transition-colors '+(sides===d?'bg-brand-500 text-white shadow':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                  d{d}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dice</label>
              <input type="number" min={1} max={20} value={count} onChange={e=>setCount(Math.min(20,Math.max(1,parseInt(e.target.value)||1)))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modifier (+/-)</label>
              <input type="number" value={modifier} onChange={e=>setModifier(parseInt(e.target.value)||0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <button onClick={roll} disabled={rolling}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-lg transition-colors">
            {rolling ? 'Rolling...' : 'Roll '+count+'d'+sides+(modifier!==0?(modifier>0?'+':'')+modifier:'')}
          </button>
          {results.length>0&&!rolling&&(
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {results.map((r,i)=>(
                  <div key={i} className="w-14 h-14 bg-brand-50 border-2 border-brand-200 rounded-xl flex items-center justify-center text-xl font-bold text-brand-700">
                    {r}
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <span className="text-gray-500 text-sm">Sum: {sum}</span>
                {modifier!==0&&<span className="text-gray-500 text-sm"> {modifier>0?'+':''}{modifier} = <span className="font-bold text-brand-600">{total}</span></span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}