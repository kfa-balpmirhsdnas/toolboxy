'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='number-sorter')
  const [input,setInput]=useState('42\n7\n15\n3\n99\n1')
  const [order,setOrder]=useState<'asc'|'desc'>('asc')
  const [sep,setSep]=useState<'newline'|'comma'|'space'>('newline')
  const [output,setOutput]=useState('')

  function sort(){
    const delim=sep==='comma'?',':sep==='space'?' ':'\n'
    const nums=input.split(delim).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n))
    nums.sort((a,b)=>order==='asc'?a-b:b-a)
    setOutput(nums.join(delim))
  }

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-4 flex-wrap'>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ns_sep')}</label>
            <select value={sep} onChange={e=>setSep(e.target.value as 'newline'|'comma'|'space')}
              className='border rounded px-3 py-2'>
              <option value='newline'>{t('ns_newline')}</option>
              <option value='comma'>{t('ns_comma')}</option>
              <option value='space'>{t('ns_space')}</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ns_order')}</label>
            <div className='flex gap-2'>
              {(['asc','desc'] as const).map(o=>(
                <button key={o} onClick={()=>setOrder(o)}
                  className={'px-3 py-2 rounded border '+(order===o?'bg-blue-600 text-white':'bg-white hover:bg-gray-50')}>
                  {o==='asc'?t('ns_asc'):t('ns_desc')}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ns_numbers')}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-36 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>{t('ns_sorted')}</label>
            <textarea readOnly value={output}
              className='w-full h-36 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <div className='flex gap-3'>
          <button onClick={sort} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>{t('ns_sort')}</button>
          {output&&<button onClick={()=>navigator.clipboard.writeText(output)} className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>{t('ui_copy')}</button>}
        </div>
      </div>
    </ToolLayout>
  )
}