'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-contrast-checker')!
function hexToRgb(hex:string):[number,number,number]|null{
  const m=hex.replace('#','').match(/^([a-fd]{2})([a-fd]{2})([a-fd]{2})$/i)
  return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:null
}
function luminance([r,g,b]:[number,number,number]):number{
  const c=[r,g,b].map(v=>{const s=v/255;return s<=0.04045?s/12.92:Math.pow((s+0.055)/1.055,2.4)})
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
}
function contrastRatio(h1:string,h2:string):number|null{
  const c1=hexToRgb(h1),c2=hexToRgb(h2)
  if(!c1||!c2)return null
  const l1=luminance(c1),l2=luminance(c2)
  const [bright,dark]=l1>l2?[l1,l2]:[l2,l1]
  return parseFloat(((bright+0.05)/(dark+0.05)).toFixed(2))
}
const PRESETS=[{name:'BW',fg:'#000000',bg:'#ffffff'},{name:'Dark',fg:'#ffffff',bg:'#1e293b'},{name:'Warn',fg:'#854d0e',bg:'#fef9c3'},{name:'Error',fg:'#7f1d1d',bg:'#fee2e2'},{name:'Info',fg:'#1e3a5f',bg:'#dbeafe'}]
export default function ColorContrastCheckerPage() {
  const t = useTranslations('toolui')
  const [fg,setFg]=useState('#000000')
  const [bg,setBg]=useState('#ffffff')
  const ratio=contrastRatio(fg,bg)
  const levelAA=ratio!==null&&ratio>=4.5
  const levelAAA=ratio!==null&&ratio>=7
  const levelAA_Large=ratio!==null&&ratio>=3
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ip_fg')}</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={fg} onChange={e=>setFg(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 font-mono text-sm uppercase"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ip_bg')}</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 font-mono text-sm uppercase"/>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-8 text-center" style={{background:bg}}>
          <p className="text-3xl font-bold mb-2" style={{color:fg}}>{t('cn_sample')}</p>
          <p className="text-sm" style={{color:fg}}>The quick brown fox jumps over the lazy dog</p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-5">
          <p className="text-6xl font-bold font-mono text-gray-800">{ratio??'—'}</p>
          <p className="text-sm text-gray-500 mt-1">{t('cn_ratio')}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['AA',levelAA,'cn_normal'],['AA Large',levelAA_Large,'cn_large'],['AAA',levelAAA,'cn_enhanced']].map(([l,pass,desc])=>(
            <div key={l as string} className={'rounded-xl px-3 py-3 text-center '+(pass?'bg-green-50 border-2 border-green-300':'bg-red-50 border-2 border-red-200')}>
              <p className="text-lg font-bold">{l as string}</p>
              <p className={'text-xs font-semibold '+(pass?'text-green-600':'text-red-500')}>{pass?t('cn_pass'):t('cn_fail')}</p>
              <p className="text-xs text-gray-500 mt-1">{t(desc as string)}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">{t('cn_presets')}</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>{setFg(p.fg);setBg(p.bg)}}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium" style={{color:p.fg,background:p.bg}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}