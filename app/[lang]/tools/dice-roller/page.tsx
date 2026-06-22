'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const DICE_TYPES=[4,6,8,10,12,20,100]

const FACES_6=[
  '\u2680','\u2681','\u2682','\u2683','\u2684','\u2685'
]


const tool = getToolBySlug('dice-roller')!

export default function DiceRollerPage() {
  const [diceType,setDiceType]=useState(6)
  const [count,setCount]=useState(1)
  const [results,setResults]=useState<number[]>([])
  const [rolling,setRolling]=useState(false)
  const [history,setHistory]=useState<{dice:string;results:number[];total:number}[]>([])

  async function roll(){
    if(rolling) return
    setRolling(true)
    setResults([])
    await new Promise(r=>setTimeout(r,400))
    const rolls=Array.from({length:count},()=>Math.floor(Math.random()*diceType)+1)
    setResults(rolls)
    setRolling(false)
    setHistory(h=>[{dice:`${count}d${diceType}`,results:rolls,total:rolls.reduce((a,b)=>a+b,0)},...h].slice(0,10))
  }

  const total=results.reduce((a,b)=>a+b,0)
  const min=Math.min(...results)
  const max=Math.max(...results)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dice Roller</h1>
        <p className="text-gray-500 mb-8">Roll any number of RPG dice — d4, d6, d8, d10, d12, d20, d100</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dice Type</label>
            <div className="flex flex-wrap gap-2">
              {DICE_TYPES.map(d=>(
                <button key={d} onClick={()=>setDiceType(d)}
                  className={'px-3 py-2 rounded-lg font-bold text-sm transition-colors '+(diceType===d?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                  d{d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dice: {count}</label>
            <input type="range" min={1} max={20} value={count} onChange={e=>setCount(parseInt(e.target.value))}
              className="w-full accent-brand-500" />
          </div>
          <button onClick={roll} disabled={rolling}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-60">
            {rolling?'Rolling...':'Roll '+count+'d'+diceType}
          </button>
        </div>
        {results.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {results.map((r,i)=>(
                <div key={i} className={'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black shadow-sm border-2 '+(r===diceType?'border-green-400 bg-green-50 text-green-700':r===1?'border-red-400 bg-red-50 text-red-700':'border-gray-200 bg-gray-50 text-gray-800')}>
                  {diceType===6?FACES_6[r-1]:r}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {[['Total',total],['Min',min],['Max',max],['Avg',(total/results.length).toFixed(1)]].map(([l,v])=>(
                <div key={l as string} className="flex-1 text-center bg-gray-50 rounded-xl p-2">
                  <div className="font-bold text-gray-900">{v}</div>
                  <div className="text-xs text-gray-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {history.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">Roll History</h2>
            <div className="space-y-2">
              {history.map((h,i)=>(
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-gray-600">{h.dice}</span>
                  <span className="text-gray-400">[{h.results.join(', ')}]</span>
                  <span className="font-bold text-brand-600">={h.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}