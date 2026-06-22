'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('dice-roller')!
type DieType=4|6|8|10|12|20|100
const DICE:DieType[]=[4,6,8,10,12,20,100]
const FACES:Record<number,string>={4:'D4',6:'D6',8:'D8',10:'D10',12:'D12',20:'D20',100:'D100'}
function rollDie(sides:number):number{return Math.floor(Math.random()*sides)+1}
function faceStr(n:number,sides:DieType):string{
  if(sides===20&&n===20)return '★'+n
  if(sides===20&&n===1)return '☠'+n
  return String(n)
}
export default function DiceRollerPage() {
  const [config,setConfig]=useState<{type:DieType;count:number}[]>([{type:6,count:2}])
  const [results,setResults]=useState<{type:DieType;rolls:number[]}[]>([])
  const [history,setHistory]=useState<string[]>([])
  const [modifier,setModifier]=useState(0)
  const roll=()=>{
    const res=config.filter(c=>c.count>0).map(c=>({type:c.type,rolls:Array.from({length:c.count},()=>rollDie(c.type))}))
    setResults(res)
    const total=res.reduce((s,r)=>s+r.rolls.reduce((a,b)=>a+b,0),0)+modifier
    const desc=res.map(r=>r.count+'d'+r.type+'['+r.rolls.join(',')+']').join(' + ')+(modifier?'+'+modifier:'')
    setHistory(h=>[desc+' = '+total,...h.slice(0,9)])
  }
  const total=results.reduce((s,r)=>s+r.rolls.reduce((a,b)=>a+b,0),0)+modifier
  const addDie=(t:DieType)=>setConfig(c=>{const e=c.find(x=>x.type===t);return e?c.map(x=>x.type===t?{...x,count:x.count+1}:x):[...c,{type:t,count:1}]})
  const rmDie=(t:DieType)=>setConfig(c=>c.map(x=>x.type===t?{...x,count:Math.max(0,x.count-1)}:x).filter(x=>x.count>0))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {DICE.map(d=>{
            const count=config.find(c=>c.type===d)?.count||0
            return(
              <div key={d} className="text-center">
                <button onClick={()=>addDie(d)} className={'w-full py-3 rounded-xl font-bold text-sm transition '+(count>0?'bg-blue-600 text-white':'border-2 border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600')}>
                  d{d}
                </button>
                {count>0&&<div className="flex items-center justify-center gap-1 mt-1">
                  <button onClick={()=>rmDie(d)} className="w-5 h-5 rounded bg-gray-200 text-xs font-bold hover:bg-red-100">-</button>
                  <span className="text-xs font-bold text-blue-600">{count}</span>
                  <button onClick={()=>addDie(d)} className="w-5 h-5 rounded bg-gray-200 text-xs font-bold hover:bg-green-100">+</button>
                </div>}
              </div>
            )
          })}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Mod</div>
            <input type="number" value={modifier} onChange={e=>setModifier(Number(e.target.value))} className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-center font-bold text-sm" min="-99" max="99"/>
          </div>
        </div>
        <button onClick={roll} disabled={config.length===0} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700 active:scale-98 transition disabled:opacity-40">
          Roll Dice
        </button>
        {results.length>0&&(
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {results.map((r,ri)=>r.rolls.map((n,i)=>(
                <div key={ri+'-'+i}
                  className={'flex items-center justify-center rounded-xl font-bold text-xl '+(r.type===20&&n===20?'bg-yellow-400 text-yellow-900':r.type===20&&n===1?'bg-red-400 text-white':'bg-white border-2 border-gray-200 text-gray-800')}
                  style={{width:52,height:52}}>
                  {n}
                </div>
              )))}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-4xl font-bold text-blue-700">{total}</p>
            </div>
          </div>
        )}
        {history.length>0&&(
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">History</p>
            {history.map((h,i)=><p key={i} className="text-xs font-mono text-gray-500 py-0.5 border-b border-gray-100 last:border-0">{h}</p>)}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}