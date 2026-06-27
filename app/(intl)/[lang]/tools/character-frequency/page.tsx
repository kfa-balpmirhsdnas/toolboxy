'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='character-frequency')
  const [input,setInput]=useState('Hello World')
  const [mode,setMode]=useState<'char'|'word'>('char')

  const freq:Record<string,number>={}
  if(mode==='char'){
    for(const c of input) freq[c]=(freq[c]||0)+1
  } else {
    const words=input.toLowerCase().match(/[a-z]+/g)||[]
    for(const w of words) freq[w]=(freq[w]||0)+1
  }
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1])
  const max=sorted[0]?.[1]||1

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          {(['char','word'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={'px-3 py-1 rounded text-sm '+(mode===m?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
              {m==='char'?t('cf_chars'):t('cf_words')}
            </button>
          ))}
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          className='w-full h-28 p-3 border rounded font-mono text-sm resize-y'
          placeholder={t('ui_text_ph')}/>
        <div className='space-y-1 max-h-64 overflow-auto'>
          {sorted.slice(0,30).map(([k,v])=>(
            <div key={k} className='flex items-center gap-2'>
              <span className='font-mono w-12 text-right text-sm'>{k===" "?t('cf_space'):k}</span>
              <div className='flex-1 bg-gray-100 rounded h-5'>
                <div className='bg-blue-500 h-5 rounded' style={{width:(v/max*100)+'%'}}/>
              </div>
              <span className='text-sm text-gray-500 w-8'>{v}</span>
            </div>
          ))}
        </div>
        <p className='text-xs text-gray-400'>{t('cf_top',{n:sorted.length,unit:mode==='char'?t('cf_unit_char'):t('cf_unit_word')})}</p>
      </div>
    </ToolLayout>
  )
}