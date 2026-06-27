'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function hexToRgb(hex:string):{r:number,g:number,b:number}|null{
  const m=hex.replace('#','').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if(!m) return null
  return {r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}
}
function toHex(n:number){return n.toString(16).padStart(2,'0').toUpperCase()}


const tool = getToolBySlug('opacity-calculator')!

export default function OpacityCalculatorPage() {
  const t = useTranslations('toolui')
  const [color,setColor]=useState('#3B82F6')
  const [bg,setBg]=useState('#FFFFFF')
  const [opacity,setOpacity]=useState(100)

  const fg=hexToRgb(color)
  const bgRgb=hexToRgb(bg)
  const alpha=opacity/100

  let blended=null
  if(fg&&bgRgb){
    const r=Math.round(fg.r*alpha+bgRgb.r*(1-alpha))
    const g=Math.round(fg.g*alpha+bgRgb.g*(1-alpha))
    const b=Math.round(fg.b*alpha+bgRgb.b*(1-alpha))
    blended={r,g,b,hex:'#'+toHex(r)+toHex(g)+toHex(b)}
  }

  const steps=[100,90,80,70,60,50,40,30,20,10]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('oc_title')}</h1>
        <p className="text-gray-500 mb-8">{t('oc_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('oc_fg')}</label>
              <div className="flex gap-2">
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={color} onChange={e=>setColor(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('oc_bg')}</label>
              <div className="flex gap-2">
                <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 font-mono text-sm" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{t('oc_opacity')}</label>
              <span className="text-brand-600 font-bold">{opacity}%</span>
            </div>
            <input type="range" min={0} max={100} value={opacity} onChange={e=>setOpacity(parseInt(e.target.value))} className="w-full" />
          </div>
          {blended&&(
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200" style={{background:bg}}>
              <div className="w-16 h-16 rounded-xl border border-white/20" style={{background:color,opacity:alpha}} />
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('oc_blended',{bg})}</p>
                <p className="text-xl font-bold font-mono" style={{color:blended.hex}}>{blended.hex}</p>
                <p className="text-sm text-gray-500">rgb({blended.r}, {blended.g}, {blended.b})</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">{t('oc_scale')}</h2>
          <div className="grid grid-cols-5 gap-2">
            {steps.map(pct=>{
              const a=pct/100
              const f=hexToRgb(color)
              const b=hexToRgb(bg)
              const hex=f&&b?'#'+toHex(Math.round(f.r*a+b.r*(1-a)))+toHex(Math.round(f.g*a+b.g*(1-a)))+toHex(Math.round(f.b*a+b.b*(1-a))):color
              return(
                <div key={pct} className="text-center cursor-pointer" onClick={()=>setOpacity(pct)}>
                  <div className="w-full h-10 rounded-lg mb-1 border border-gray-100" style={{background:color,opacity:a}} />
                  <div className="text-xs text-gray-500">{pct}%</div>
                  <div className="text-xs font-mono text-gray-400">{hex}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}