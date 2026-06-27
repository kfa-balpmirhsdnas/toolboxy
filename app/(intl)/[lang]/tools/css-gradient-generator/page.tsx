'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-gradient-generator')!
type Stop={color:string;position:number}
type GradType='linear'|'radial'|'conic'
const PRESETS=[
  {name:'cgg_p_sunset',type:'linear' as GradType,angle:135,stops:[{color:'#f97316',position:0},{color:'#ec4899',position:50},{color:'#8b5cf6',position:100}]},
  {name:'cgg_p_ocean',type:'linear' as GradType,angle:180,stops:[{color:'#06b6d4',position:0},{color:'#3b82f6',position:50},{color:'#6366f1',position:100}]},
  {name:'cgg_p_forest',type:'linear' as GradType,angle:90,stops:[{color:'#84cc16',position:0},{color:'#22c55e',position:100}]},
  {name:'cgg_p_fire',type:'radial' as GradType,angle:0,stops:[{color:'#fef08a',position:0},{color:'#f97316',position:50},{color:'#dc2626',position:100}]},
  {name:'cgg_p_mono',type:'linear' as GradType,angle:0,stops:[{color:'#f8fafc',position:0},{color:'#1e293b',position:100}]},
]
export default function CssGradientGeneratorPage() {
  const t = useTranslations('toolui')
  const [type,setType]=useState<GradType>('linear')
  const [angle,setAngle]=useState(135)
  const [stops,setStops]=useState<Stop[]>([{color:'#6366f1',position:0},{color:'#ec4899',position:100}])
  const [copied,setCopied]=useState(false)
  const gradStr=():string=>{
    const s=stops.sort((a,b)=>a.position-b.position).map(s=>s.color+' '+s.position+'%').join(', ')
    if(type==='linear')return 'linear-gradient('+angle+'deg, '+s+')'
    if(type==='radial')return 'radial-gradient(circle, '+s+')'
    return 'conic-gradient(from '+angle+'deg, '+s+')'
  }
  const css='background: '+gradStr()+';'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const addStop=()=>setStops(s=>[...s,{color:'#ffffff',position:50}])
  const updStop=(i:number,k:keyof Stop,v:string|number)=>setStops(s=>{const n=[...s];(n[i] as Record<string,unknown>)[k]=v;return n})
  const delStop=(i:number)=>stops.length>2&&setStops(s=>s.filter((_,j)=>j!==i))
  const loadPreset=(p:typeof PRESETS[0])=>{setType(p.type);setAngle(p.angle);setStops(p.stops.map(s=>({...s})))}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.name} onClick={()=>loadPreset(p)}
              className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{t(p.name)}</button>
          ))}
        </div>
        <div className="h-36 rounded-xl border border-gray-200 shadow-inner transition-all" style={{background:gradStr()}}/>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex rounded overflow-hidden border border-gray-300">
            {(['linear','radial','conic'] as const).map(gt=>(
              <button key={gt} onClick={()=>setType(gt)}
                className={'px-3 py-1.5 text-xs font-medium capitalize transition '+(type===gt?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{gt}</button>
            ))}
          </div>
          {type!=='radial'&&(
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('cgg_angle')}</span>
              <input type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="w-24"/>
              <span className="text-xs font-mono text-blue-600 w-10">{angle}deg</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">{t('cgg_stops')}</p>
            <button onClick={addStop} className="text-xs text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50">{t('cu_add')}</button>
          </div>
          {stops.map((s,i)=>(
            <div key={i} className="flex gap-2 items-center">
              <input type="color" value={s.color} onChange={e=>updStop(i,'color',e.target.value)} className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={s.color} onChange={e=>updStop(i,'color',e.target.value)} className="w-24 rounded border border-gray-300 px-2 py-1.5 font-mono text-xs"/>
              <input type="range" min="0" max="100" value={s.position} onChange={e=>updStop(i,'position',Number(e.target.value))} className="flex-1"/>
              <span className="text-xs font-mono text-gray-600 w-10 text-right">{s.position}%</span>
              {stops.length>2&&<button onClick={()=>delStop(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none">x</button>}
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <code className="text-green-400 font-mono text-sm break-all">{css}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
        </div>
      </div>
    </ToolLayout>
  )
}