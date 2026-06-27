'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='unicode-converter')
  const [input,setInput]=useState('Hello')
  const [mode,setMode]=useState<'toCode'|'fromCode'>('toCode')

  function toUnicode(s:string){
    return Array.from(s).map(c=>'U+'+c.codePointAt(0)!.toString(16).toUpperCase().padStart(4,'0')).join(' ')
  }

  function fromUnicode(s:string){
    return s.replace(/U\+([0-9A-Fa-f]+)/g,(_,h)=>String.fromCodePoint(parseInt(h,16)))
  }

  const output=mode==='toCode'?toUnicode(input):fromUnicode(input)

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <button onClick={()=>setMode('toCode')}
            className={'px-4 py-2 rounded '+(mode==='toCode'?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
            {t('uc_to')}
          </button>
          <button onClick={()=>setMode('fromCode')}
            className={'px-4 py-2 rounded '+(mode==='fromCode'?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
            {t('uc_from')}
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ui_input')}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-32 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ui_output')}</label>
            <textarea readOnly value={output}
              className='w-full h-32 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <button onClick={()=>navigator.clipboard.writeText(output)}
          className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm'>{t('ui_copy')}</button>
      </div>
    </ToolLayout>
  )
}