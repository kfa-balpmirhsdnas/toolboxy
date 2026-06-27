'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function shuffle<T>(arr:T[]):T[]{
  const a=[...arr]
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1))
    ;[a[i],a[j]]=[a[j],a[i]]
  }
  return a
}

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='list-randomizer')
  const [input,setInput]=useState('Apple\nBanana\nCherry\nDate\nElder')
  const [result,setResult]=useState('')
  const lines=input.split('\n').filter(l=>l.trim())
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('lr_items')} ({lines.length})</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-48 p-3 border rounded font-mono text-sm resize-y'
              placeholder={t('lr_ph')}/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('lr_randomized')}</label>
            <textarea readOnly value={result}
              className='w-full h-48 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <div className='flex gap-3'>
          <button onClick={()=>setResult(shuffle(lines).join('\n'))}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>{t('lr_shuffle')}</button>
          {result&&<button onClick={()=>navigator.clipboard.writeText(result)}
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>{t('ui_copy')}</button>}
        </div>
      </div>
    </ToolLayout>
  )
}