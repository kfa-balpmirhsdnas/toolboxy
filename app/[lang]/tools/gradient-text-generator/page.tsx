'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('gradient-text-generator')!
const PRESETS=[
  {name:'Sunset',stops:['#f97316','#ec4899','#8b5cf6']},
  {name:'Ocean',stops:['#06b6d4','#3b82f6','#6366f1']},
  {name:'Forest',stops:['#84cc16','#10b981','#06b6d4']},
  {name:'Neon',stops:['#f0abfc','#818cf8','#67e8f9']},
  {name:'Fire',stops:['#fbbf24','#f97316','#ef4444']},
  {name:'Purple Rain',stops:['#a78bfa','#7c3aed','#ec4899']},
  {name:'Mint',stops:['#6ee7b7','#3b82f6','#9333ea']},
  {name:'Gold',stops:['#fde68a','#f59e0b','#d97706']},
]
export default function GradientTextGeneratorPage() {
  const [text,setText]=useState('Gradient Text')
  const [size,setSize]=useState(64)
  const [weight,setWeight]=useState('800')
  const [angle,setAngle]=useState(90)
  const [stops,setStops]=useState(['#f97316','#ec4899','#8b5cf6'])
  const [copied,setCopied]=useState(false)
  const gradient='linear-gradient('+angle+'deg, '+stops.join(', ')+')'
  const css='.gradient-text {\n  background: '+gradient+';
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}'\n  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const addStop=()=>{if(stops.length<6)setStops(s=>[...s,'#ffffff'])}
  const removeStop=(i:number)=>{if(stops.length>2)setStops(s=>s.filter((_,idx)=>idx!==i))}
  const updateStop=(i:number,v:string)=>setStops(s=>s.map((c,idx)=>idx===i?v:c))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="min-h-32 flex items-center justify-center bg-gray-900 rounded-2xl px-6 py-8">
          <p style={{background:gradient,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontSize:Math.min(size,80)+'px',fontWeight:weight,lineHeight:1.1,textAlign:'center',wordBreak:'break-word'}}>
            {text||'Gradient Text'}
          </p>
        </div>
        <div><input value={text} onChange={e=>setText(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2.5 text-center text-lg font-medium" placeholder="Enter your text"/></div>
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Font size: {size}px</label>
            <input type="range" min="16" max="120" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full"/></div>
          <div className="w-28"><label className="block text-xs text-gray-500 mb-1">Angle: {angle}deg</label>
            <input type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="w-full"/></div>
          <div className="w-24"><label className="block text-xs text-gray-500 mb-1">Weight</label>
            <select value={weight} onChange={e=>setWeight(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
              {['400','500','600','700','800','900'].map(w=><option key={w}>{w}</option>)}</select></div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>setStops(p.stops)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{background:'linear-gradient(90deg,'+p.stops.join(',')+')'}}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">Color stops</p>
            <button onClick={addStop} className="text-xs text-blue-600 hover:underline">+ Add stop</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stops.map((c,i)=>(
              <div key={i} className="flex items-center gap-1">
                <input type="color" value={c} onChange={e=>updateStop(i,e.target.value)} className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/>
                {stops.length>2&&<button onClick={()=>removeStop(i)} className="text-gray-400 hover:text-red-400 text-sm leading-none">x</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex justify-between gap-3">
          <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{css}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs h-fit hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}