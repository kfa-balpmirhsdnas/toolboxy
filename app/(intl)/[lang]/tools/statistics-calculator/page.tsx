'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='statistics-calculator')!
  const [input,setInput]=useState('4 8 15 16 23 42')
  const nums=input.split(/[,\s]+/).map(Number).filter(n=>!isNaN(n)&&String(n)!=='')
  const s=stats(nums)
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('st_label')}</label>
          <input value={input} onChange={e=>setInput(e.target.value)}
            className='w-full border rounded px-3 py-2 font-mono text-sm'
            placeholder='e.g. 1 2 3 4 5'/>
        </div>
        {s&&(
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {[
              ['st_count',s.n],['st_sum',s.sum.toFixed(4)],['st_mean',s.mean.toFixed(4)],
              ['st_median',s.median.toFixed(4)],['st_mode',s.mode.join(', ')],
              ['st_min',s.min],['st_max',s.max],['st_range',s.range],
              ['st_stddev',s.stddev.toFixed(4)],['st_variance',s.variance.toFixed(4)]
            ].map(([l,v])=>(
              <div key={String(l)} className='bg-gray-50 border rounded p-3'>
                <div className='text-xs text-gray-500'>{t(String(l))}</div>
                <div className='font-mono font-bold'>{v}</div>
              </div>
            ))}
          </div>
        )}
        {!s&&<p className='text-gray-400 text-sm'>{t('st_empty')}</p>}
      </div>
    </ToolLayout>
  )
}