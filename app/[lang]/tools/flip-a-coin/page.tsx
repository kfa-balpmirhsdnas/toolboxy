'use client'
import { useState } from 'react'

export default function FlipACoinPage() {
  const [result, setResult] = useState<'heads'|'tails'|null>(null)
  const [flipping, setFlipping] = useState(false)
  const [history, setHistory] = useState<('heads'|'tails')[]>([])
  const [stats, setStats] = useState({heads:0,tails:0})

  function flip() {
    if (flipping) return
    setFlipping(true)
    setTimeout(() => {
      const r = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(r)
      setHistory(h => [r, ...h].slice(0, 20))
      setStats(s => ({...s, [r]: s[r]+1}))
      setFlipping(false)
    }, 600)
  }

  function reset() { setResult(null); setHistory([]); setStats({heads:0,tails:0}) }

  const total = stats.heads + stats.tails

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flip a Coin</h1>
        <p className="text-gray-500 mb-8">Flip a fair virtual coin — heads or tails?</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div
            className={'w-36 h-36 mx-auto rounded-full flex items-center justify-center text-5xl font-bold shadow-lg border-4 transition-all duration-300 '+(flipping?'animate-spin border-gray-300 bg-gray-100':result==='heads'?'border-yellow-400 bg-yellow-50 text-yellow-600':result==='tails'?'border-blue-400 bg-blue-50 text-blue-600':'border-gray-200 bg-gray-50 text-gray-400')}
          >
            {flipping ? '?' : result === 'heads' ? 'H' : result === 'tails' ? 'T' : '?'}
          </div>
          <div className="mt-4 text-2xl font-bold text-gray-700 h-8">
            {flipping ? 'Flipping...' : result ? result.charAt(0).toUpperCase()+result.slice(1) : ''}
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={flip} disabled={flipping}
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-lg">
              Flip!
            </button>
            {total > 0 && (
              <button onClick={reset} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">Reset</button>
            )}
          </div>
          {total > 0 && (
            <div className="mt-6 flex gap-6 justify-center text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.heads}</div>
                <div className="text-gray-500">Heads ({total?Math.round(stats.heads/total*100):0}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.tails}</div>
                <div className="text-gray-500">Tails ({total?Math.round(stats.tails/total*100):0}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">{total}</div>
                <div className="text-gray-500">Total Flips</div>
              </div>
            </div>
          )}
        </div>
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Flip History (last 20)</h2>
            <div className="flex flex-wrap gap-2">
              {history.map((h,i) => (
                <span key={i} className={'px-2 py-1 rounded text-xs font-medium '+(h==='heads'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700')}>
                  {h==='heads'?'H':'T'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}