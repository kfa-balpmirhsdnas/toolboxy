'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-box-shadow-generator')!
const PRESETS=[{label:'Soft',x:0,y:4,blur:6,spread:-1,color:'rgba(0,0,0,0.1)',inset:false},{label:'Hard',x:4,y:4,blur:0,spread:0,color:'rgba(0,0,0,0.25)',inset:false},{label:'Large',x:0,y:20,blur:25,spread:-5,color:'rgba(0,0,0,0.1)',inset:false},{label:'Glow',x:0,y:0,blur:15,spread:0,color:'rgba(59,130,246,0.5)',inset:false},{label:'Inner',x:0,y:2,blur:4,spread:0,color:'rgba(0,0,0,0.2)',inset:true},{label:'None',x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,0)',inset:false}]
export default function CssBoxShadowGeneratorPage() {
  const [x,setX]=useState(0)
  const [y,setY]=useState(4)
  const [blur,setBlur]=useState(6)
  const [spread,setSpread]=useState(-1)
  const [color,setColor]=useState('#00000019')
  const [inset,setInset]=useState(false)
  const [bg,setBg]=useState('#ffffff')
  const [copied,setCopied]=useState(false)
  const shadow=(inset?'inset ':'')+x+'px '+y+'px '+blur+'px '+spread+'px '+color
  const css='box-shadow: '+shadow+';'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  const Slider=({label,value,onChange,min,max}:{label:string;value:number;onChange:(n:number)=>void;min:number;max:number})=>(
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-gray-600 w-16">{label}</label>
      <input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))} className="flex-1"/>
      <span className="text-xs font-mono text-gray-800 w-10 text-right">{value}px</span>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setX(p.x);setY(p.y);setBlur(p.blur);setSpread(p.spread);setColor(p.color);setInset(p.inset)}}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">{p.label}</button>
          ))}
        </div>
        <div className="space-y-3">
          <Slider label="Offset X" value={x} onChange={setX} min={-50} max={50}/>
          <Slider label="Offset Y" value={y} onChange={setY} min={-50} max={50}/>
          <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={100}/>
          <Slider label="Spread" value={spread} onChange={setSpread} min={-50} max={50}/>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600 w-16">Color</label>
            <input type="color" value={color.length===9?color.slice(0,7):color} onChange={e=>setColor(e.target.value)} className="w-10 h-8 rounded border border-gray-200 cursor-pointer p-0.5"/>
            <input value={color} onChange={e=>setColor(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-2 py-1 font-mono text-xs focus:outline-none"/>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={inset} onChange={e=>setInset(e.target.checked)} className="rounded"/>
            <span className="text-xs font-medium text-gray-600">Inset shadow</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600">Card bg:</label>
          <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5"/>
        </div>
        <div className="flex items-center justify-center py-12 bg-gray-100 rounded-2xl">
          <div className="w-40 h-24 rounded-2xl transition-all duration-200" style={{backgroundColor:bg,boxShadow:shadow}}/>
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <code className="text-green-400 text-xs">{css}</code>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'✓':'Copy'}</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}