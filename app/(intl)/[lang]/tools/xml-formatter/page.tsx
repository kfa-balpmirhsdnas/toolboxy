'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function fmtXml(xml:string,sp:number):string{
  let out='',d=0
  const ind=()=>' '.repeat(sp*d)
  const tags=xml.match(/<[^>]+>|[^<]+/g)||[]
  for(const t of tags){
    const s=t.trim()
    if(!s) continue
    if(s.startsWith('</')){d--;out+=ind()+s+'\n'}
    else if(s.startsWith('<?')||s.startsWith('<!')) out+=ind()+s+'\n'
    else if(/\/>$/.test(s)) out+=ind()+s+'\n'
    else if(s.startsWith('<')){out+=ind()+s+'\n';d++}
    else out+=ind()+s+'\n'
  }
  return out.trim()
}

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='xml-formatter')
  const [input,setInput]=useState('<root><child><item>Hello</item></child></root>')
  const [spaces,setSpaces]=useState(2)
  const [output,setOutput]=useState('')
  const [error,setError]=useState('')

  function format(){
    try{setOutput(fmtXml(input,spaces));setError('')}
    catch(e){setError('Error: '+(e as Error).message)}
  }
  function minify(){ setOutput(input.replace(/\s*(<[^>]+>)\s*/g,'$1').trim()) }

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-3 items-center'>
          <label className='text-sm font-medium'>{t('xf_indent')}</label>
          <select value={spaces} onChange={e=>setSpaces(Number(e.target.value))} className='border rounded px-2 py-1'>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('xf_input')}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} className='w-full h-48 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ui_output')}</label>
            <textarea readOnly value={output} className='w-full h-48 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        {error&&<p className='text-red-500 text-sm'>{error}</p>}
        <div className='flex gap-3'>
          <button onClick={format} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>{t('ui_format')}</button>
          <button onClick={minify} className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>{t('jf_minify')}</button>
          {output&&<button onClick={()=>navigator.clipboard.writeText(output)} className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>{t('ui_copy')}</button>}
        </div>
      </div>
    </ToolLayout>
  )
}