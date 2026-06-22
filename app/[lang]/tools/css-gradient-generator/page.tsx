'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-gradient-generator')!
type Stop={color:string;pos:number}
export default function CssGradientGeneratorPage() {
  const [type,setType]=useState<'linear'|'radial'>('linear')
  const [angle,setAngle]=useState(135)
  const [stops,setStops]=useState<Stop[]>([{color:'#6366f1',pos:0},{color:'#ec4899',pos:100}])
  const [copied,setCopied]=useState(false)
  const sortedStops=[...stops].sort((a,b)=>a.pos-b.pos)
  const stopStr=sortedStops.map(s=>s.color+' '+s.pos+'%').join(', ')
  const css=type==='linear'?'linear-gradient('+angle+'deg, '+stopStr+')':'radial-gradient(circle, '+stopStr+')'
  const cssRule='background: '+css+';'
  const addStop=()=>setStops([...stops,{color:'#ffffff',pos:50}])
  const removeStop=(i:number)=>{if(stops.length>2)setStops(stops.filter((_,j)=>j!==i))}
  const updateStop=(i:number,k:keyof Stop,v:string|number)=>setStops(stops.map((s,j)=>j===i?{...s,[k]:v}:s))
  const copy=()=>{navigator.clipboard.writeText(cssRule);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="h-32 rounded-xl border border-gray-200 transition-all" style={{background:css}}/>
        <div className="flex gap-2">
          {(['linear','radial'] as const).map(t=>(
            <button key={t} onClick={()=>setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${type===t?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        {type==='linear'&&(
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="font-medium text-gray-700">Angle</label>
              <span className="font-mono text-blue-700">{angle}°</span>
            </div>
            <input type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="w-full"/>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Color Stops</p>
            <button onClick={addStop} className="text-xs text-blue-600 hover:underline">+ Add stop</button>
          </div>
          {stops.map((s,i)=>(
            <div key={i} className="flex items-center gap-2">
              <input type="color" value={s.color} onChange={e=>updateStop(i,'color',e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={s.color} onChange={e=>updateStop(i,'color',e.target.value)} className="w-24 rounded border border-gray-300 px-2 py-1 font-mono text-xs"/>
              <input type="range" min="0" max="100" value={s.pos} onChange={e=>updateStop(i,'pos',Number(e.target.value))} className="flex-1"/>
              <span className="w-10 text-xs font-mono text-center text-gray-600">{s.pos}%</span>
              {stops.length>2&&<button onClick={()=>removeStop(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>}
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between gap-3">
          <code className="text-green-400 text-xs font-mono break-all flex-1">{cssRule}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}