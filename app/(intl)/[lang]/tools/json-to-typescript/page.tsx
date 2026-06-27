'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function jsonToTs(obj:unknown,name='Root',indent=0):string{
  const sp='  '.repeat(indent)
  const sp2='  '.repeat(indent+1)
  if(obj===null) return 'null'
  if(Array.isArray(obj)){
    if(obj.length===0) return 'any[]'
    const itemType=jsonToTs(obj[0],name+'Item',indent)
    return itemType+'[]'
  }
  if(typeof obj==='object'){
    const entries=Object.entries(obj as Record<string,unknown>)
    if(entries.length===0) return 'Record<string,unknown>'
    const nested:string[]=[]
    const body=entries.map(([k,v])=>{
      let t:string
      if(v===null) t='null'
      else if(typeof v==='object'){
        const iname=name+k.charAt(0).toUpperCase()+k.slice(1)
        nested.push(jsonToTs(v,iname,indent))
        t=iname
      } else t=typeof v
      return sp2+k+': '+t+';'
    }).join('\n')
    return 'interface '+name+' {\n'+body+'\n'+sp+'}'+(nested.length?'\n\n'+nested.join('\n\n'):'')
  }
  return typeof obj
}

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='json-to-typescript')
  const [input,setInput]=useState('{"name":"Alice","age":30,"tags":["dev","designer"]}')
  const [output,setOutput]=useState('')
  const [error,setError]=useState('')

  function convert(){
    try{
      const obj=JSON.parse(input)
      setOutput(jsonToTs(obj))
      setError('')
    }catch(e){
      setError(t('jm_invalid')+': '+(e as Error).message)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('jm_input')}</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            className="w-full h-36 p-3 border rounded font-mono text-sm resize-y"
            placeholder='{"key": "value"}'/>
        </div>
        {error&&<p className="text-red-500 text-sm">{error}</p>}
        <button onClick={convert}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {t('jtt_convert')}
        </button>
        {output&&(
          <div>
            <label className="block text-sm font-medium mb-1">{t('jtt_interface')}</label>
            <pre className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto whitespace-pre">{output}</pre>
            <button onClick={()=>navigator.clipboard.writeText(output)}
              className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">{t('ui_copy')}</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
