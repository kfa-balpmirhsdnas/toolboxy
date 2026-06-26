'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='column-extractor')
  const [input,setInput]=useState('Name,Age,City\nAlice,30,New York\nBob,25,London\nCarol,35,Tokyo')
  const [sep,setSep]=useState('comma')
  const [cols,setCols]=useState('1')
  const [output,setOutput]=useState('')

  function extract(){
    const delimiter=sep==='comma'?',':sep==='tab'?'\t':sep==='pipe'?'|':' '
    const colNums=cols.split(',').map(c=>parseInt(c.trim())-1).filter(n=>!isNaN(n))
    const rows=input.trim().split('\n').map(row=>row.split(delimiter))
    const result=rows.map(row=>colNums.map(i=>row[i]||'').join('\t')).join('\n')
    setOutput(result)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">{t('cvw_delim')}</label>
            <select value={sep} onChange={e=>setSep(e.target.value)} className="border rounded px-3 py-2">
              <option value="comma">{t('ce_comma')}</option>
              <option value="tab">{t('ce_tab')}</option>
              <option value="pipe">{t('ce_pipe')}</option>
              <option value="space">{t('ce_space')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('ce_cols')}</label>
            <input value={cols} onChange={e=>setCols(e.target.value)}
              className="border rounded px-3 py-2 w-40" placeholder="1,2"/>
          </div>
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          className="w-full h-36 p-3 border rounded font-mono text-sm resize-y"
          placeholder={t('ce_ph')}/>
        <button onClick={extract}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {t('ce_extract')}
        </button>
        {output&&(
          <div>
            <label className="block text-sm font-medium mb-1">{t('ce_result')}</label>
            <textarea readOnly value={output}
              className="w-full h-36 p-3 border rounded font-mono text-sm bg-gray-50 resize-y"/>
            <button onClick={()=>navigator.clipboard.writeText(output)}
              className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">{t('ui_copy')}</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
