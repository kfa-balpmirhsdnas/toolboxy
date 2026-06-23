'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
const DICE=[4,6,8,10,12,20,100]
export default function Page(){
  const [sides,setSides]=useState(6)
  const [count,setCount]=useState(2)
  const [rolls,setRolls]=useState<number[]>([])
  const [rolling,setRolling]=useState(false)
  const roll=async()=>{
    setRolling(true)
    await new Promise(r=>setTimeout(r,300))
    setRolls(Array.from({length:count},()=>Math.floor(Math.random()*sides)+1))
    setRolling(false)
  }
  const total=rolls.reduce((a,b)=>a+b,0)
  const tool=TOOLS.find(t=>t.slug==='dice-roller')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-5 text-center">
        <div className="flex gap-2 justify-center flex-wrap">
          {DICE.map(d=><button key={d} onClick={()=>setSides(d)} className={'px-3 py-1.5 rounded-lg font-semibold text-sm border '+(sides===d?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>d{d}</button>)}
        </div>
        <label className="flex items-center gap-2 justify-center text-sm text-gray-700">Dice
          <input type="number" min={1} max={10} value={count} onChange={e=>setCount(+e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-1 text-center"/></label>
        <button onClick={roll} disabled={rolling} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-60 active:scale-95">
          {rolling?'Rolling...':'Roll d'+sides}</button>
        {rolls.length>0&&<>
          <div className="flex flex-wrap gap-3 justify-center">
            {rolls.map((r,i)=><div key={i} className="w-14 h-14 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold shadow-lg">{r}</div>)}
          </div>
          {count>1&&<p className="text-lg font-bold">Total: <span className="text-blue-600">{total}</span></p>}
        </>}
      </div>
    </ToolLayout>
  )
}