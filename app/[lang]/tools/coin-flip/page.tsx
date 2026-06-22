'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('coin-flip')!

export default function CoinFlipPage() {
  const [result,setResult]=useState<'heads'|'tails'|null>(null)
  const [flipping,setFlipping]=useState(false)
  const [history,setHistory]=useState<('heads'|'tails')[]>([])
  const [heads,setHeads]=useState(0)
  const [tails,setTails]=useState(0)

  async function flip(){
    if(flipping)return
    setFlipping(true)
    setResult(null)
    await new Promise(r=>setTimeout(r,600))
    const r=Math.random()<0.5?'heads':'tails' as 'heads'|'tails'
    setResult(r)
    setFlipping(false)
    setHistory(h=>[r,...h].slice(0,20))
    if(r==='heads')setHeads(n=>n+1)
    else setTails(n=>n+1)
  }

  const total=heads+tails

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coin Flip</h1>
        <p className="text-gray-500 mb-8">Flip a virtual coin — heads or tails?</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center gap-6">
          <button onClick={flip} disabled={flipping}
            className="w-40 h-40 rounded-full text-6xl shadow-lg border-4 border-gray-200 bg-gradient-to-br from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center select-none"
            style={{transform:flipping?'rotateY(360deg)':'',transition:'transform 0.6s'}}>
            {flipping?'\u{1FA99}':result==='heads'?'H':result==='tails'?'T':'\u{1FA99}'}
          </button>
          <div className="text-2xl font-bold text-gray-800">{flipping?'Flipping...':result?result.charAt(0).toUpperCase()+result.slice(1):'Click to flip'}</div>
          <button onClick={flip} disabled={flipping} className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold disabled:opacity-60">Flip Coin</button>
          {total>0&&(
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Heads: {heads} ({total>0?(heads/total*100).toFixed(0):0}%)</span>
                <span>Tails: {tails} ({total>0?(tails/total*100).toFixed(0):0}%)</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div style={{width:(total>0?heads/total*100:50)+'%'}} className="bg-yellow-400 rounded-full transition-all" />
                <div style={{width:(total>0?tails/total*100:50)+'%'}} className="bg-brand-500 rounded-full transition-all" />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">{total} flip{total!==1?'s':''} total</p>
            </div>
          )}
          {history.length>0&&(
            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">Recent flips</p>
              <div className="flex flex-wrap gap-1">
                {history.map((h,i)=>(
                  <span key={i} className={'text-xs px-2 py-0.5 rounded-full font-medium '+(h==='heads'?'bg-yellow-100 text-yellow-800':'bg-brand-50 text-brand-700')}>{h==='heads'?'H':'T'}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}