'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function genUuidV4():string{
  const bytes=new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6]=(bytes[6]&0x0f)|0x40
  bytes[8]=(bytes[8]&0x3f)|0x80
  const hex=Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}


const tool = getToolBySlug('uuid-generator')!

export default function UuidGeneratorPage() {
  const t = useTranslations('toolui')
  const [count,setCount]=useState(5)
  const [uuids,setUuids]=useState<string[]>(()=>Array.from({length:5},genUuidV4))
  const [uppercase,setUppercase]=useState(false)
  const [hyphens,setHyphens]=useState(true)
  const [copied,setCopied]=useState<string|null>(null)

  function generate(){setUuids(Array.from({length:count},genUuidV4))}

  function fmt(u:string):string{
    let s=uppercase?u.toUpperCase():u
    if(!hyphens) s=s.replace(/-/g,'')
    return s
  }

  function copyOne(u:string){navigator.clipboard.writeText(fmt(u));setCopied(u);setTimeout(()=>setCopied(null),1500)}
  function copyAll(){navigator.clipboard.writeText(uuids.map(fmt).join('\n'));setCopied('all');setTimeout(()=>setCopied(null),1500)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('uug_title')}</h1>
        <p className="text-gray-500 mb-8">{t('uug_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('ubg_count')}:</label>
              <input type="number" value={count} min={1} max={50} onChange={e=>setCount(Math.min(50,Math.max(1,parseInt(e.target.value)||1)))}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-mono text-center focus:outline-none" />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)} className="rounded" />
              {t('pg_uppercase')}
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={hyphens} onChange={e=>setHyphens(e.target.checked)} className="rounded" />
              {t('uug_hyphens')}
            </label>
            <div className="flex gap-2 ml-auto">
              <button onClick={copyAll} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">{copied==='all'?'\u2713 '+t('ui_copied'):t('ui_copy_all')}</button>
              <button onClick={generate} className="px-4 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium">{t('ui_generate')}</button>
            </div>
          </div>
          <div className="space-y-1.5">
            {uuids.map((u,i)=>(
              <div key={i} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 group">
                <span className="font-mono text-sm text-gray-800 flex-1 break-all">{fmt(u)}</span>
                <button onClick={()=>copyOne(u)} className="text-xs text-gray-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">{copied===u?'\u2713':t('ui_copy')}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-2">{t('uug_about')}</h2>
          <p className="text-sm text-gray-600">{t('uug_abouttext')}</p>
        </div>
      </div>
    </ToolLayout>
  )
}