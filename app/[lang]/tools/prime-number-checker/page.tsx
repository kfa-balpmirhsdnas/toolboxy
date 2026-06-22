'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('prime-number-checker')!
function isPrime(n:number):boolean{
  if(n<2)return false
  if(n===2||n===3)return true
  if(n%2===0||n%3===0)return false
  for(let i=5;i*i<=n;i+=6)if(n%i===0||n%(i+2)===0)return false
  return true
}
function getFactors(n:number):number[]{
  const f:number[]=[]
  for(let i=1;i*i<=n;i++)if(n%i===0){f.push(i);if(i!==n/i)f.push(n/i)}
  return f.sort((a,b)=>a-b)
}
function primesInRange(s:number,e:number):number[]{
  const r:number[]=[]
  for(let i=Math.max(2,s);i<=e&&r.length<500;i++)if(isPrime(i))r.push(i)
  return r
}
export default function PrimeNumberCheckerPage() {
  const [num,setNum]=useState('17')
  const [rs,setRs]=useState('1')
  const [re,setRe]=useState('100')
  const [rp,setRp]=useState<number[]|null>(null)
  const n=parseInt(num)
  const valid=!isNaN(n)&&n>=0&&n<=999999999
  const prime=valid?isPrime(n):null
  const factors=valid&&prime===false&&n>1?getFactors(n):[]
  const nextP=()=>{let x=n+1;while(!isPrime(x))x++;return x}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter a number</label>
          <input type="number" value={num} onChange={e=>setNum(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-xl" min="0" max="999999999"/>
        </div>
        {valid&&prime!==null&&(
          <div className={`rounded-xl p-6 text-center border-2 ${prime?'bg-green-50 border-green-300':'bg-red-50 border-red-300'}`}>
            <p className="text-4xl font-bold mb-2" style={{color:prime?'#15803d':'#b91c1c'}}>
              {n} is {prime?'PRIME':'NOT PRIME'}
            </p>
            {!prime&&n>1&&<p className="text-sm text-gray-600 mt-1">Factors: {factors.join(', ')}</p>}
            {prime&&n<999999999&&<p className="text-sm text-gray-500 mt-1">Next prime: {nextP()}</p>}
          </div>
        )}
        <div className="border-t pt-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Find primes in a range</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">From</label>
              <input type="number" value={rs} onChange={e=>setRs(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">To</label>
              <input type="number" value={re} onChange={e=>setRe(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <button onClick={()=>{const s=parseInt(rs),e=parseInt(re);if(!isNaN(s)&&!isNaN(e)&&e>=s&&e-s<=100000)setRp(primesInRange(s,e))}}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap">Find</button>
          </div>
          {rp!==null&&(
            <div className="mt-3 bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2 font-medium">{rp.length} primes found</p>
              <p className="font-mono text-sm text-gray-800 break-all leading-relaxed">{rp.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}