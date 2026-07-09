'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

// Tailwind CSS color palette — shared source in lib/color-names (also powers the per-color pages)
import { TW_PALETTE as TW } from '@/lib/color-names'

function hexToRgb(hex:string):{r:number,g:number,b:number}|null{
  const m=hex.replace('#','').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if(!m) return null
  return{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}
}
function colorDist(a:{r:number,g:number,b:number},b:{r:number,g:number,b:number}):number{
  return Math.sqrt((a.r-b.r)**2+(a.g-b.g)**2+(a.b-b.b)**2)
}


const tool = getToolBySlug('color-to-tailwind')!

export default function ColorToTailwindPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState('#3b82f6')
  const [copied,setCopied]=useState('')

  const rgb=hexToRgb(input)
  const matches=rgb?TW.map(c=>({...c,dist:colorDist(rgb,hexToRgb(c.hex)!)})).sort((a,b)=>a.dist-b.dist).slice(0,5):[]
  const best=matches[0]

  function copy(v:string){navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ctw_title')}</h1>
        <p className="text-gray-500 mb-8">{t('ctw_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-3 items-center">
            <input type="color" value={input} onChange={e=>setInput(e.target.value)} className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer" />
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="#3b82f6"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {best&&rgb&&(
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">{t('cnf_best')}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-white shadow" style={{background:best.hex}} />
                  <div>
                    <p className="font-mono font-bold text-gray-800">{best.hex}</p>
                    <p className="text-sm text-gray-500">{best.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>copy('bg-'+best.name)} className={'text-xs px-2 py-1 rounded-lg '+(copied==='bg-'+best.name?'bg-brand-500 text-white':'bg-gray-200')}>bg-{best.name}</button>
                  <button onClick={()=>copy('text-'+best.name)} className={'text-xs px-2 py-1 rounded-lg '+(copied==='text-'+best.name?'bg-brand-500 text-white':'bg-gray-200')}>text-{best.name}</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {matches.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">{t('ctw_top5')}</h2>
            <div className="space-y-2">
              {matches.map((c,i)=>(
                <div key={c.name} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span className="text-xs text-gray-400 w-4">{i+1}</span>
                  <div className="w-8 h-8 rounded-lg border border-gray-200" style={{background:c.hex}} />
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.hex} \u2022 \u0394{Math.round(c.dist)}</p>
                  </div>
                  <button onClick={()=>copy('bg-'+c.name)} className={'text-xs px-2 py-0.5 rounded '+(copied==='bg-'+c.name?'bg-brand-500 text-white':'bg-gray-100')}>{t('ui_copy')}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}