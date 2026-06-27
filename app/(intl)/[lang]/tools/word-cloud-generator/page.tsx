'use client'
import {useState,useMemo} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='word-cloud-generator')
  const [input,setInput]=useState('the quick brown fox jumps over the lazy dog the fox jumps high over every fence quickly')
  const [maxWords,setMaxWords]=useState(30)

  const words=useMemo(()=>{
    const stop=new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','it','this','that'])
    const freq:Record<string,number>={}
    const tokens=input.toLowerCase().match(/[a-z]+/g)||[]
    for(const w of tokens) if(!stop.has(w)&&w.length>2) freq[w]=(freq[w]||0)+1
    const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,maxWords)
    const maxCount=sorted[0]?.[1]||1
    const colors=['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#14B8A6','#F97316']
    return sorted.map(([w,c],i)=>({
      word:w,
      count:c,
      size:Math.round(14+c/maxCount*36),
      color:colors[i%colors.length]
    }))
  },[input,maxWords])

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          className='w-full h-28 p-3 border rounded font-mono text-sm resize-y'
          placeholder={t('wcg_ph')}/>
        <label className='flex items-center gap-2 text-sm'>
          {t('wcg_maxwords')}
          <input type='range' min={10} max={50} value={maxWords} onChange={e=>setMaxWords(Number(e.target.value))} className='flex-1'/>
          <span className='w-8'>{maxWords}</span>
        </label>
        <div className='border rounded p-4 min-h-48 bg-white flex flex-wrap gap-2 items-center justify-center'>
          {words.map(({word,size,color})=>(
            <span key={word} style={{fontSize:size+'px',color,lineHeight:'1.2',display:'inline-block'}}>
              {word}
            </span>
          ))}
          {words.length===0&&<p className='text-gray-400'>{t('wcg_nowords')}</p>}
        </div>
        <p className='text-xs text-gray-400'>{t('wcg_showing',{n:words.length})}</p>
      </div>
    </ToolLayout>
  )
}