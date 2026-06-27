'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='whitespace-remover')
  const [input,setInput]=useState('  Hello   World  \n  Extra   spaces  ')
  const [mode,setMode]=useState('trim')
  const [output,setOutput]=useState('')

  function process(){
    let result=input
    if(mode==='trim') result=input.split('\n').map(l=>l.trim()).join('\n')
    else if(mode==='collapse') result=input.replace(/[ \t]+/g,' ').split('\n').map(l=>l.trim()).join('\n')
    else if(mode==='all') result=input.replace(/\s+/g,' ').trim()
    else if(mode==='lines') result=input.split('\n').filter(l=>l.trim()).join('\n')
    else if(mode==='tabs') result=input.replace(/\t/g,' ')
    setOutput(result)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('ww_mode')}</label>
          <div className="flex flex-wrap gap-2">
            {[
              {val:'trim',label:'wsr_trim'},
              {val:'collapse',label:'wsr_collapse'},
              {val:'all',label:'wsr_all'},
              {val:'lines',label:'wsr_blank'},
              {val:'tabs',label:'wsr_tabs'},
            ].map(({val,label})=>(
              <button key={val} onClick={()=>setMode(val)}
                className={"px-3 py-1.5 rounded text-sm border "+(mode===val?'bg-blue-600 text-white border-blue-600':'bg-white hover:bg-gray-50')}>
                {t(label)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('ui_input')}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className="w-full h-40 p-3 border rounded font-mono text-sm resize-y"
              placeholder={t('wsr_ph')}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('ui_output')}</label>
            <textarea readOnly value={output}
              className="w-full h-40 p-3 border rounded font-mono text-sm bg-gray-50 resize-y"/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={process}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {t('wsr_remove')}
          </button>
          {output&&(
            <button onClick={()=>navigator.clipboard.writeText(output)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              {t('wsr_copyresult')}
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
