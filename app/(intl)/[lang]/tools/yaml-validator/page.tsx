'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function validateYaml(text:string,t:(k:string,v?:Record<string,unknown>)=>string):{valid:boolean;error?:string;lines?:number}{
  if(!text.trim()) return {valid:false,error:t('yv_empty')}
  const lines=text.split('\n')
  let prevIndent=-1
  for(let i=0;i<lines.length;i++){
    const line=lines[i]
    if(!line.trim()||line.trim().startsWith('#')) continue
    const indent=line.search(/\S/)
    if(indent>prevIndent+2&&prevIndent!==-1){
      // soft check only
    }
    prevIndent=indent
    // check for tabs
    if(line.match(/^\t/)) return {valid:false,error:t('yv_tabs',{n:i+1})}
    // check basic key-value
    const stripped=line.trim()
    if(!stripped.startsWith('-')&&!stripped.startsWith('#')&&stripped.includes(':')){
      const [key]=stripped.split(':')
      if(key.trim()===''&&!stripped.startsWith(':')) continue
    }
  }
  return {valid:true,lines:lines.length}
}

const SAMPLE=`name: John Doe
age: 30
address:
  street: 123 Main St
  city: Springfield
hobbies:
  - reading
  - coding
  - hiking`

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='yaml-validator')
  const [input,setInput]=useState(SAMPLE)
  const result=validateYaml(input,t)

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          className='w-full h-64 p-3 border rounded font-mono text-sm resize-y'
          placeholder={t('yv_ph')}/>
        <div className={'p-4 rounded border '+(result.valid?'bg-green-50 border-green-300':'bg-red-50 border-red-300')}>
          {result.valid
            ?<p className='text-green-700 font-medium'>{t('yv_valid',{n:result.lines})}</p>
            :<p className='text-red-700 font-medium'>{t('yv_invalid')}: {result.error}</p>
          }
        </div>
      </div>
    </ToolLayout>
  )
}