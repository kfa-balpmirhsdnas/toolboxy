'use client'
import { useState } from 'react'

function isPrime(n: number): boolean {
  if (n<2) return false; if (n===2) return true; if (n%2===0) return false
  for (let i=3;i*i<=n;i+=2) if(n%i===0) return false
  return true
}
function getFactors(n: number): number[] {
  if (n<2) return []; const f: number[]=[];let d=2,r=n
  while(d*d<=r){while(r%d===0){f.push(d);r=Math.floor(r/d)}d++}
  if(r>1) f.push(r); return f
}
function nthPrime(n: number): number {
  let c=0,num=1; while(c<n){num++;if(isPrime(num))c++} return num
}
function primesInRange(from: number, to: number): number[] {
  const r: number[]=[];for(let i=Math.max(2,from);i<=Math.min(to,10000);i++) if(isPrime(i)) r.push(i); return r
}

export default function PrimeNumberChecker() {
  const [n,setN]=useState('97')
  const [nth,setNth]=useState('10')
  const [from,setFrom]=useState('1')
  const [to,setTo]=useState('100')
  const [tab,setTab]=useState<'check'|'nth'|'range'>('check')
  const num=parseInt(n)||0,isP=isPrime(num),factors=getFactors(num)
  const nthNum=parseInt(nth)||1
  const nthRes=nthNum>=1&&nthNum<=10000?nthPrime(nthNum):null
  const f=parseInt(from)||1,t=parseInt(to)||100
  const rangeRes=f<=t?primesInRange(f,t):[]
  const tabs=[{k:'check',l:'Check Number'},{k:'nth',l:'Nth Prime'},{k:'range',l:'Primes in Range'}] as const
  const ordinal=(x:number)=>x+(x===1?'st':x===2?'nd':x===3?'rd':'th')
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prime Number Tools</h1>
        <p className="text-gray-500 mb-8">Check primality, find the Nth prime, or list all primes in a range.</p>
        <div className="flex gap-2 mb-6">
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab===t.k?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t.l}</button>
          ))}
        </div>
        {tab==='check' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter a number</label>
            <input type="number" value={n} onChange={e=>setN(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" min="0"/>
            {n && num>=0 && (
              <div>
                <div className={`text-center p-6 rounded-xl mb-4 ${isP?'bg-green-50 border-2 border-green-200':'bg-red-50 border-2 border-red-200'}`}>
                  <div className="text-4xl mb-2">{isP?'✓':'✗'}</div>
                  <div className={`text-2xl font-bold ${isP?'text-green-700':'text-red-700'}`}>{num} is {isP?'':'not '}<strong>prime</strong></div>
                </div>
                {!isP&&num>1&&(
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Prime factorization:</p>
                    <p className="font-mono text-lg text-gray-800">{num} = {factors.join(' × ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {tab==='nth' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Find the Nth prime (1–10,000)</label>
            <input type="number" value={nth} onChange={e=>setNth(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" min="1" max="10000"/>
            {nthRes && <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-600 mb-1">The {ordinal(nthNum)} prime number is</p>
              <p className="text-5xl font-black text-blue-700">{nthRes.toLocaleString()}</p>
            </div>}
          </div>
        )}
        {tab==='range' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">From</label><input type="number" value={from} onChange={e=>setFrom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">To (max 10,000)</label><input type="number" value={to} onChange={e=>setTo(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-sm text-gray-600 mb-3">Found <strong>{rangeRes.length}</strong> primes:</p>
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                {rangeRes.map(p=><span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm font-mono">{p}</span>)}
                {!rangeRes.length&&<span className="text-gray-400 text-sm">No primes in range.</span>}
              </div>
            </div>
            {rangeRes.length>0&&<button onClick={()=>navigator.clipboard.writeText(rangeRes.join(', '))} className="text-xs text-blue-600 hover:underline">Copy all</button>}
          </div>
        )}
      </div>
    </div>
  )
}