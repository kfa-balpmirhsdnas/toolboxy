'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('gradient-text-generator')!
const PRESETS:{name:string;colors:string[];angle:number}[]=[
  {name:'Sunset',colors:['#ff6b6b','#feca57'],angle:135},
  {name:'Ocean',colors:['#0ea5e9','#6366f1'],angle:135},
  {name:'Forest',colors:['#22c55e','#0ea5e9'],angle:135},
  {name:'Candy',colors:['#f472b6','#a855f7','#3b82f6'],angle:135},
  {name:'Fire',colors:['#ef4444','#f97316','#eab308'],angle:90},
  {name:'Neon',colors:['#10b981','#06b6d4'],angle:135},
]
export default function GradientTextGeneratorPage() {
  const [text,setText]=useState('Hello World')
  const [colors,setColors]=useState(['#f472b6','#a855f7','#3b82f6'])
  const [angle,setAngle]=useState(135)
  const [fontSize,setFontSize]=useState(64)
  const [fontWeight,setFontWeight]=useState('800')
  const [copied,setCopied]=useState(false)
  const gradient=`linear-gradient(${angle}deg, ${colors.join(', ')})`
  const css=`.gradient-text {\n  background: ${gradient};\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  font-size: ${fontSize}px;\n  font-weight: ${fontWeight};\n}`
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const addColor=()=>setColors(c=>[...c,'#ffffff'])
  const removeColor=(i:number)=>setColors(c=>c.filter((_,idx)=>idx!==i))
  const setColor=(i:number,v:string)=>setColors(c=>c.map((col,idx)=>idx===i?v:col))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>{setColors(p.colors);setAngle(p.angle)}}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50"
                style={{background:`linear-gradient(135deg, ${p.colors.join(', ')})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontWeight:'bold'}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
          <input value={text} onChange={e=>setText(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-lg"/></div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Colors</label>
            <button onClick={addColor} className="text-xs text-blue-600 hover:underline">+ Add color</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c,i)=>(
              <div key={i} className="flex items-center gap-1">
                <input type="color" value={c} onChange={e=>setColor(i,e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
                {colors.length>2&&<button onClick={()=>removeColor(i)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Angle: {angle}°</label>
            <input type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="w-full"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Font size: {fontSize}px</label>
            <input type="range" min="16" max="120" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
            <select value={fontWeight} onChange={e=>setFontWeight(e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm">
              {['400','600','700','800','900'].map(w=><option key={w} value={w}>{w}</option>)}
            </select></div>
        </div>
        <div className="bg-gray-900 rounded-xl p-8 text-center overflow-hidden">
          <p style={{fontSize:fontSize+'px',fontWeight,background:gradient,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'inline-block',wordBreak:'break-all'}}>
            {text||'Preview'}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <pre className="text-green-400 text-xs font-mono flex-1 overflow-x-auto whitespace-pre-wrap">{css}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}