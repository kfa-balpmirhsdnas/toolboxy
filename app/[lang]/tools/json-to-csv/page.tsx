'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function j2c(json,t){
  try{
    const arr=Array.isArray(JSON.parse(json))?JSON.parse(json):[JSON.parse(json)]
    if(!arr.length)return ''
    const headers=[...new Set(arr.flatMap(o=>Object.keys(o)))]
    const esc=v=>{const s=v==null?'':String(v);return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s}
    return [headers.join(','),...arr.map(row=>headers.map(h=>esc(row[h])).join(','))].join('\n')
  }catch(e){return t('jm_invalid')}
}
export default function Page(){
  const t = useTranslations('toolui')
  const [json,setJson]=useState('[{"name":"Alice","age":30},{"name":"Bob","age":25}]')
  const csv=j2c(json,t)
  const dl=()=>{const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='data.csv';a.click()}
  const tool=TOOLS.find(x=>x.slug==='json-to-csv')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('jm_input')}</label>
          <textarea value={json} onChange={e=>setJson(e.target.value)} rows={6} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('jc_output')}</label>
          <textarea value={csv} readOnly rows={8} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div className="flex gap-2">
          <button onClick={()=>navigator.clipboard?.writeText(csv)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{t('ui_copy')}</button>
          <button onClick={dl} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">{t('ui_download')}</button>
        </div>
      </div>
    </ToolLayout>
  )
}