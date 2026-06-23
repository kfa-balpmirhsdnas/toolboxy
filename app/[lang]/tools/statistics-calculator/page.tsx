'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function stats(nums:number[]){
  if(!nums.length) return null
  const sorted=[...nums].sort((a,b)=>a-b)
  const n=nums.length
  const sum=nums.reduce((a,b)=>a+b,0)
  const mean=sum/n
  const mid=Math.floor(n/2)
  const median=n%2===0?(sorted[mid-1]+sorted[mid])/2:sorted[mid]
  const freq:Record<number,number>={}
  for(const v of nums) freq[v]=(freq[v]||0)+1
  const maxF=Math.max(...Object.values(freq))
  const mode=Object.entries(freq).filter(([,f])=>f===maxF).map(([v])=>Number(v))
  const variance=nums.reduce((a,b)=>a+(b-mean)**2,0)/n
  const stddev=Math.sqrt(variance)
  return {n,sum,mean,median,mode,min:sorted[0],max:sorted[n-1],range:sorted[n-1]-sorted[0],stddev,variance}
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='statistics-calculator')
  const [input,setInput]=useState('4 8 15 16 23 42')
  const nums=input.split(/[,\s]+/).map(Number).filter(n=>!isNaN(n)&&String(n)!=='')
  const s=stats(nums)
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Numbers (space or comma separated)</label>
          <input value={input} onChange={e=>setInput(e.target.value)}
            className='w-full border rounded px-3 py-2 font-mono text-sm'
            placeholder='e.g. 1 2 3 4 5'/>
        </div>
        {s&&(
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {[
              ['Count',s.n],['Sum',s.sum.toFixed(4)],['Mean',s.mean.toFixed(4)],
              ['Median',s.median.toFixed(4)],['Mode',s.mode.join(', ')],
              ['Min',s.min],['Max',s.max],['Range',s.range],
              ['Std Dev',s.stddev.toFixed(4)],['Variance',s.variance.toFixed(4)]
            ].map(([l,v])=>(
              <div key={String(l)} className='bg-gray-50 border rounded p-3'>
                <div className='text-xs text-gray-500'>{l}</div>
                <div className='font-mono font-bold'>{v}</div>
              </div>
            ))}
          </div>
        )}
        {!s&&<p className='text-gray-400 text-sm'>Enter numbers above to see statistics.</p>}
      </div>
    </ToolLayout>
  )
}