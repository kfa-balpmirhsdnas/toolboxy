'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function isPrime(n:number):boolean{
  if(n<2) return false
  if(n===2) return true
  if(n%2===0) return false
  for(let i=3;i<=Math.sqrt(n);i+=2) if(n%i===0) return false
  return true
}
function getFactors(n:number):number[]{
  const f:number[]=[]
  for(let i=2;i<=n;i++) while(n%i===0){f.push(i);n/=i}
  return f
}
function nextPrime(n:number):number{let x=n+1;while(!isPrime(x))x++;return x}
function prevPrime(n:number):number{let x=n-1;while(x>1&&!isPrime(x))x--;return x>1?x:2}
function primesUpTo(n:number):number[]{return Array.from({length:n-1},(_,i)=>i+2).filter(isPrime)}


const tool = getToolBySlug('prime-number-checker')!

export default function PrimeNumberCheckerPage() {
  const [input,setInput]=useState('17')
  const [rangeEnd,setRangeEnd]=useState('100')

  const n=parseInt(input)||0
  const prime=isPrime(n)
  const factors=n>1&&!prime?getFactors(n):[]
  const np=n>0?nextPrime(n):null
  const pp=n>2?prevPrime(n):null
  const primes=primesUpTo(Math.min(parseInt(rangeEnd)||100,1000))

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prime Number Checker</h1>
        <p className="text-gray-500 mb-8">Check if a number is prime, find its factors, and list all primes up to a given value</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check Number</label>
            <input type="number" value={input} onChange={e=>setInput(e.target.value)} min={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {n>0&&(
            <div className={'rounded-xl p-4 border '+(prime?'bg-green-50 border-green-200':'bg-orange-50 border-orange-200')}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{prime?'\u2713':'\u00D7'}</span>
                <div>
                  <p className={'text-xl font-bold '+(prime?'text-green-700':'text-orange-700')}>
                    {n.toLocaleString()} is {prime?'a prime number':'not prime'}
                  </p>
                  {!prime&&factors.length>0&&<p className="text-sm text-gray-500 mt-0.5">Factors: {factors.join(' \u00D7 ')}</p>}
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                {pp&&<div><span className="text-gray-500">Previous prime: </span><button onClick={()=>setInput(String(pp))} className="font-mono font-semibold text-brand-600 hover:underline">{pp}</button></div>}
                {np&&<div><span className="text-gray-500">Next prime: </span><button onClick={()=>setInput(String(np))} className="font-mono font-semibold text-brand-600 hover:underline">{np}</button></div>}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Primes up to:</h2>
            <div className="flex items-center gap-2">
              <input type="number" value={rangeEnd} onChange={e=>setRangeEnd(e.target.value)} min={2} max={1000}
                className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm font-mono" />
              <span className="text-xs text-gray-400">(max 1000)</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">{primes.length} prime numbers found</p>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {primes.map(p=>(
              <button key={p} onClick={()=>setInput(String(p))}
                className={'px-2 py-1 rounded text-sm font-mono '+(n===p?'bg-brand-500 text-white':'bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-gray-700')}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}