'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('prime-number-checker')!
function isPrime(n:number):boolean{
  if(n<2)return false
  if(n<4)return true
  if(n%2===0||n%3===0)return false
  for(let i=5;i*i<=n;i+=6)if(n%i===0||n%(i+2)===0)return false
  return true
}
function getFactors(n:number):number[]{
  const f:number[]=[],orig=n
  for(let d=2;d*d<=n;d++){while(n%d===0){f.push(d);n=Math.floor(n/d)}}
  if(n>1)f.push(n)
  return f
}
function sieve(limit:number):number[]{
  const comp=new Array(limit+1).fill(false)
  comp[0]=comp[1]=true
  for(let i=2;i*i<=limit;i++)if(!comp[i])for(let j=i*i;j<=limit;j+=i)comp[j]=true
  return Array.from({length:limit-1},(_,i)=>i+2).filter((_,i)=>!comp[i+2])
}
function nextPrime(n:number):number{let m=n+1;while(!isPrime(m))m++;return m}
function prevPrime(n:number):number{let m=n-1;while(m>1&&!isPrime(m))m--;return m>1?m:-1}
export default function PrimeNumberCheckerPage() {
  const [num,setNum]=useState(17)
  const [mode,setMode]=useState<'check'|'list'>('check')
  const [limit,setLimit]=useState(100)
  const prime=isPrime(num)
  const factors=prime?[num]:getFactors(num)
  const primes=sieve(Math.min(limit,1000))
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(primes.join(', '));setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('check')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='check'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Check Number</button>
          <button onClick={()=>setMode('list')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='list'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>List Primes</button>
        </div>
        {mode==='check'?(
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Enter a number</label>
              <input type="number" value={num} onChange={e=>setNum(Number(e.target.value))} min="0" className="w-full rounded border border-gray-300 px-3 py-3 text-2xl font-mono text-center"/></div>
            <div className={'text-center p-6 rounded-xl '+(prime?'bg-green-50 border-2 border-green-300':'bg-gray-50 border-2 border-gray-200')}>
              <p className="text-4xl font-bold mb-1" style={{color:prime?'#16a34a':'#374151'}}>{prime?'PRIME':'COMPOSITE'}</p>
              <p className="text-sm" style={{color:prime?'#15803d':'#6b7280'}}>{num} is {prime?'a prime number':'not a prime number'}</p>
            </div>
            {!prime&&num>1&&(
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Prime factorization</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {factors.map((f,i)=>(
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="font-mono text-lg font-bold text-blue-700">{f}</span>
                      {i<factors.length-1&&<span className="text-gray-400 text-xl">x</span>}
                    </span>
                  ))}
                  <span className="text-gray-400 ml-1">= {num}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Previous prime</p>
                <p className="text-xl font-bold text-gray-800 font-mono">{prevPrime(num)>1?prevPrime(num):'—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Next prime</p>
                <p className="text-xl font-bold text-gray-800 font-mono">{nextPrime(num)}</p>
              </div>
            </div>
          </div>
        ):(
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">List primes up to (max 1000)</label>
              <div className="flex gap-2">
                <input type="number" value={limit} onChange={e=>setLimit(Math.min(1000,Math.max(2,Number(e.target.value))))} className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-xl text-center"/>
                <button onClick={copy} className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">{copied?'Copied!':'Copy'}</button>
              </div></div>
            <p className="text-xs text-gray-500">{primes.length} primes found</p>
            <div className="bg-gray-50 rounded-xl p-3 max-h-64 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {primes.map(p=>(
                  <span key={p} className="font-mono text-sm bg-white border border-gray-200 rounded px-1.5 py-0.5 text-blue-700">{p}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}