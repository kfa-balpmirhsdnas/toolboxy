'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('coin-flip')!
export default function CoinFlipPage() {
  const [result,setResult]=useState<'heads'|'tails'|null>(null)
  const [flipping,setFlipping]=useState(false)
  const [counts,setCounts]=useState({heads:0,tails:0})
  const [history,setHistory]=useState<Array<'heads'|'tails'>>([])
  const [times,setTimes]=useState(1)
  const flip=()=>{
    if(flipping)return
    setFlipping(true)
    setTimeout(()=>{
      const results:Array<'heads'|'tails'>=Array.from({length:times},()=>Math.random()<0.5?'heads':'tails')
      const last=results[results.length-1]
      setResult(last)
      setCounts(c=>({heads:c.heads+results.filter(r=>r==='heads').length,tails:c.tails+results.filter(r=>r==='tails').length}))
      setHistory(h=>[...results.reverse(),...h].slice(0,50))
      setFlipping(false)
    },600)
  }
  const total=counts.heads+counts.tails
  const headsP=total>0?Math.round(counts.heads/total*100):50
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5 text-center">
        <div className="flex items-center justify-center gap-3">
          <label className="text-sm text-gray-600">Flip</label>
          <select value={times} onChange={e=>setTimes(Number(e.target.value))} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
            {[1,2,5,10,20,50,100].map(n=><option key={n}>{n}</option>)}
          </select>
          <label className="text-sm text-gray-600">coin{times>1?'s':''} at once</label>
        </div>
        <div className={'text-9xl transition-all duration-300 cursor-pointer select-none '+(flipping?'opacity-0 scale-75':'opacity-100 scale-100')}
          onClick={flip} title="Click to flip">
          {result===null?'🪙':result==='heads'?'👑':'🦅'}
        </div>
        {result&&!flipping&&<p className="text-2xl font-bold capitalize text-gray-800">{result}!</p>}
        <button onClick={flip} disabled={flipping}
          className={'w-full py-3 rounded-2xl font-bold text-white text-lg transition '+(flipping?'bg-gray-400 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 active:scale-95')}>
          {flipping?'Flipping...':'Flip'}
        </button>
        {total>0&&(
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600">Results ({total} total)</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-xl py-3 shadow-sm">
                <p className="text-2xl font-bold text-gray-800">{counts.heads}</p>
                <p className="text-xs text-gray-500">Heads ({headsP}%)</p>
              </div>
              <div className="flex-1 bg-white rounded-xl py-3 shadow-sm">
                <p className="text-2xl font-bold text-gray-800">{counts.tails}</p>
                <p className="text-xs text-gray-500">Tails ({100-headsP}%)</p>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-gray-200">
              <div className="h-full bg-blue-500 transition-all duration-500 rounded-full" style={{width:headsP+'%'}}/>
            </div>
            <div className="flex flex-wrap gap-1 justify-center max-h-24 overflow-y-auto">
              {history.map((r,i)=>(
                <span key={i} className={'text-lg '+(r==='heads'?'':'opacity-60')}>{r==='heads'?'👑':'🦅'}</span>
              ))}
            </div>
            <button onClick={()=>{setCounts({heads:0,tails:0});setHistory([]);setResult(null)}} className="text-xs text-gray-400 hover:text-red-500">Reset stats</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}