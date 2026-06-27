'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('random-number-generator')!
export default function RandomNumberGeneratorPage() {
  const t = useTranslations('toolui')
  const [min,setMin]=useState(1)
  const [max,setMax]=useState(100)
  const [count,setCount]=useState(1)
  const [unique,setUnique]=useState(false)
  const [numbers,setNumbers]=useState<number[]>([])
  const [copied,setCopied]=useState(false)
  const generate=()=>{
    if(min>=max)return
    const range=max-min+1
    if(unique&&count>range){alert(t('rng_alert'));return}
    const pool=Array.from({length:range},(_,i)=>min+i)
    if(unique){
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
      setNumbers(pool.slice(0,count))
    } else {
      setNumbers(Array.from({length:count},()=>Math.floor(Math.random()*range)+min))
    }
  }
  const copy=()=>{navigator.clipboard.writeText(numbers.join(', '));setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('st_min')}</label>
            <input type="number" value={min} onChange={e=>setMin(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('st_max')}</label>
            <input type="number" value={max} onChange={e=>setMax(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('rng_howmany')} ({count})</label>
          <input type="range" min="1" max="100" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full"/>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={unique} onChange={e=>setUnique(e.target.checked)} className="rounded"/>
          <span className="text-sm text-gray-700">{t('rng_unique')}</span>
        </label>
        <button onClick={generate} className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">
          {t('ui_generate')}
        </button>
        {numbers.length>0&&(
          <div>
            {count===1?(
              <div className="bg-blue-50 rounded-xl p-8 text-center">
                <p className="text-6xl font-bold text-blue-700">{numbers[0]}</p>
              </div>
            ):(
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  {numbers.map((n,i)=>(
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono font-semibold">{n}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={copy} className="mt-3 w-full border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">
              {copied?t('ui_copied'):t('rng_copynums')}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}