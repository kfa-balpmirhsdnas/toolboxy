'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('aspect-ratio-calculator')!
const PRESETS=[{label:'16:9 HD',w:16,h:9},{label:'4:3 Standard',w:4,h:3},{label:'1:1 Square',w:1,h:1},{label:'21:9 Ultra',w:21,h:9},{label:'3:2 Photo',w:3,h:2},{label:'9:16 Portrait',w:9,h:16},{label:'2.35:1 Cinema',w:235,h:100},{label:'4:5 Instagram',w:4,h:5}]
function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}
export default function AspectRatioCalculatorPage() {
  const t = useTranslations('toolui')
  const [mode,setMode]=useState<'ratio'|'size'>('size')
  const [width,setWidth]=useState(1920)
  const [height,setHeight]=useState(1080)
  const [ratW,setRatW]=useState(16)
  const [ratH,setRatH]=useState(9)
  const [lockW,setLockW]=useState(1280)
  const g=gcd(Math.round(width),Math.round(height))
  const rW=Math.round(width)/g,rH=Math.round(height)/g
  const ratio=width/height
  const fromRatio=(w:number,h:number)=>{
    const r=w/h
    return Array.from({length:6},(_,i)=>{const bw=Math.round(lockW*(i===0?1:i===1?0.75:i===2?0.5:i===3?1.5:i===4?2:0.25));return{w:bw,h:Math.round(bw/r)}})
  }
  const sizes=mode==='ratio'?fromRatio(ratW,ratH):fromRatio(rW,rH)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('size')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='size'?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>{t('ar_from_dim')}</button>
          <button onClick={()=>setMode('ratio')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='ratio'?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>{t('ar_from_ratio')}</button>
        </div>
        {mode==='size'?(
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">{t('ui_width')} (px)</label>
              <input type="number" value={width} onChange={e=>setWidth(Number(e.target.value))} min="1"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center text-lg font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">{t('ui_height')} (px)</label>
              <input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))} min="1"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center text-lg font-bold focus:outline-none focus:border-blue-400"/></div>
          </div>
        ):(
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">{t('ar_ratw')}</label>
                <input type="number" value={ratW} onChange={e=>setRatW(Number(e.target.value))} min="1"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center text-lg font-bold focus:outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs text-gray-500 mb-1">{t('ar_rath')}</label>
                <input type="number" value={ratH} onChange={e=>setRatH(Number(e.target.value))} min="1"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center text-lg font-bold focus:outline-none focus:border-blue-400"/></div>
            </div>
            <div><label className="block text-xs text-gray-500 mb-1">{t('ar_lockw')}</label>
              <input type="number" value={lockW} onChange={e=>setLockW(Number(e.target.value))} min="1"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center focus:outline-none focus:border-blue-400"/></div>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{if(mode==='ratio'){setRatW(p.w);setRatH(p.h)}else{setWidth(p.w*100);setHeight(p.h*100)}}}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">{p.label}</button>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">{t('ar_aspect')}</p>
          <p className="text-3xl font-bold text-blue-700">{mode==='size'?rW+':'+rH:ratW+':'+ratH}</p>
          <p className="text-sm text-blue-500 mt-1">= {(mode==='size'?ratio:ratW/ratH).toFixed(4)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">{t('ar_common')}</p>
          <div className="space-y-1.5">
            {sizes.map((s,i)=>(
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-sm">
                <span className="font-mono font-medium text-gray-800">{s.w} × {s.h}</span>
                <span className="text-xs text-gray-400">{s.w}px {t('ar_wide')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}