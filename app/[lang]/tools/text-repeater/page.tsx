'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-repeater')!
export default function TextRepeaterPage() {
  const t = useTranslations('toolui')
  const [text,setText]=useState('Hello')
  const [count,setCount]=useState(5)
  const [sep,setSep]=useState('\n')
  const [copied,setCopied]=useState(false)
  const SEP_PRESETS=[{label:'ns_newline',val:'\n'},{label:'ns_space',val:' '},{label:'ns_comma',val:','},{label:'bx_p_none',val:''}]
  const result=count>0&&text?Array(Math.min(count,1000)).fill(text).join(sep):''
  const charCount=result.length
  const copy=()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('tr_label')}</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 resize-none"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tr_count')}: {count}</label>
            <input type="range" min="1" max="100" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full"/>
            <input type="number" min="1" max="1000" value={count} onChange={e=>setCount(Math.min(1000,Math.max(1,Number(e.target.value))))} className="w-full mt-1 rounded border border-gray-300 px-2 py-1 text-sm text-center"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ns_sep')}</label>
            <div className="flex flex-wrap gap-1 mb-1">
              {SEP_PRESETS.map(p=>(
                <button key={p.label} onClick={()=>setSep(p.val)}
                  className={`px-2 py-1 rounded border text-xs font-medium transition ${sep===p.val?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{t(p.label)}</button>
              ))}
            </div>
            <input value={sep.replace(/\n/g,'\\n')} onChange={e=>setSep(e.target.value.replace(/\\n/g,'\n'))} placeholder={t('tr_custom_sep')} className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-mono"/>
          </div>
        </div>
        {result&&(
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">{t('tr_stats',{c:charCount.toLocaleString(),r:count})}</span>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?t('ui_copied'):t('ui_copy')}</button>
            </div>
            <textarea readOnly value={result} rows={6} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono resize-none"/>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}