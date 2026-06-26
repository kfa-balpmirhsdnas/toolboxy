'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const PAIRS=[
  {h:'Playfair Display',b:'Source Sans Pro',t:'fpt_elegant'},
  {h:'Montserrat',b:'Merriweather',t:'fpt_modern'},
  {h:'Oswald',b:'Lato',t:'fpt_strong'},
  {h:'Raleway',b:'Roboto',t:'fpt_clean'},
  {h:'Lora',b:'Open Sans',t:'fpt_classic'},
  {h:'Abril Fatface',b:'Poppins',t:'fpt_bold'},
]

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='font-pairing-tool')
  const [sel,setSel]=useState(0)
  const [htxt,setHtxt]=useState('The quick brown fox')
  const [btxt,setBtxt]=useState('Pack my box with five dozen liquor jugs.')
  const p=PAIRS[sel]
  const url='https://fonts.googleapis.com/css2?family='+p.h.replace(/ /g,'+')+'&family='+p.b.replace(/ /g,'+')+'&display=swap'
  return (
    <ToolLayout tool={tool}>
      <link rel='stylesheet' href={url}/>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
          {PAIRS.map((pair,i)=>(
            <button key={i} onClick={()=>setSel(i)}
              className={'border rounded p-3 text-left text-sm '+(sel===i?'border-blue-500 bg-blue-50':'hover:bg-gray-50')}>
              <div className='font-medium'>{pair.h}</div>
              <div className='text-gray-500 text-xs'>{pair.b}</div>
              <span className='text-xs bg-gray-100 px-1 rounded'>{t(pair.t)}</span>
            </button>
          ))}
        </div>
        <div className='flex gap-4'>
          <input value={htxt} onChange={e=>setHtxt(e.target.value)} placeholder={t('fpt_heading_ph')}
            className='border rounded px-3 py-2 flex-1 text-sm'/>
          <input value={btxt} onChange={e=>setBtxt(e.target.value)} placeholder={t('fpt_body_ph')}
            className='border rounded px-3 py-2 flex-1 text-sm'/>
        </div>
        <div className='border rounded p-6 bg-white space-y-4'>
          <h2 style={{fontFamily:p.h,fontSize:'2rem'}}>{htxt}</h2>
          <p style={{fontFamily:p.b,fontSize:'1rem'}}>{btxt}</p>
          <p className='text-xs text-gray-400'>{t('fpt_heading')}: {p.h} | {t('fpt_body')}: {p.b}</p>
        </div>
      </div>
    </ToolLayout>
  )
}