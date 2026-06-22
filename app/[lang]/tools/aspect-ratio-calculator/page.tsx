'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('aspect-ratio-calculator')!
function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}
function simplify(w:number,h:number):[number,number]{const g=gcd(Math.round(w),Math.round(h));return[Math.round(w/g),Math.round(h/g)]}
const PRESETS=[{label:'16:9',w:16,h:9},{label:'4:3',w:4,h:3},{label:'1:1',w:1,h:1},{label:'21:9',w:21,h:9},{label:'3:2',w:3,h:2},{label:'9:16',w:9,h:16},{label:'2.39:1',w:239,h:100},{label:'5:4',w:5,h:4}]
export default function AspectRatioCalculatorPage() {
  const [ratioW,setRatioW]=useState(16)
  const [ratioH,setRatioH]=useState(9)
  const [width,setWidth]=useState(1920)
  const [height,setHeight]=useState(1080)
  const [locked,setLocked]=useState<'w'|'h'>('w')
  const ratio=ratioW/ratioH
  const calcH=(w:number)=>Math.round(w/ratio)
  const calcW=(h:number)=>Math.round(h*ratio)
  const handleW=(v:number)=>{setWidth(v);if(locked==='w')setHeight(calcH(v))}
  const handleH=(v:number)=>{setHeight(v);if(locked==='h')setWidth(calcW(v))}
  const handleRatioW=(v:number)=>{setRatioW(v);setHeight(Math.round(width*v/ratioH))}
  const handleRatioH=(v:number)=>{setRatioH(v);setWidth(Math.round(height*v/ratioW))}
  const [sw,sh]=simplify(width,height)
  const megapixels=(width*height/1000000).toFixed(1)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setRatioW(p.w);setRatioH(p.h);setHeight(calcH(width))}}
              className={'px-3 py-1.5 rounded-full border text-xs font-medium transition '+(ratioW===p.w&&ratioH===p.h?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{p.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center flex-1">
            <label className="block text-xs text-gray-500 mb-1">Ratio W</label>
            <input type="number" value={ratioW} onChange={e=>handleRatioW(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-2 text-xl font-mono text-center"/></div>
          <span className="text-2xl text-gray-400">:</span>
          <div className="text-center flex-1">
            <label className="block text-xs text-gray-500 mb-1">Ratio H</label>
            <input type="number" value={ratioH} onChange={e=>handleRatioH(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-2 text-xl font-mono text-center"/></div>
        </div>
        <div className="flex justify-center">
          <div className="border-2 border-blue-400 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-medium"
            style={{width:'200px',height:Math.round(200/ratio)+'px',minHeight:'40px',maxHeight:'200px'}}>
            {ratioW}:{ratioH}
          </div>
        </div>
        <div className="flex rounded overflow-hidden border border-gray-300">
          <button onClick={()=>setLocked('w')} className={'flex-1 py-1.5 text-xs font-medium transition '+(locked==='w'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Fix Width</button>
          <button onClick={()=>setLocked('h')} className={'flex-1 py-1.5 text-xs font-medium transition '+(locked==='h'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Fix Height</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Width (px)</label>
            <input type="number" value={width} onChange={e=>handleW(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2 font-mono"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Height (px)</label>
            <input type="number" value={height} onChange={e=>handleH(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-2 font-mono"/></div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Simplified</p><p className="font-bold text-gray-800">{sw}:{sh}</p></div>
          <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Ratio</p><p className="font-bold text-gray-800">{(ratioW/ratioH).toFixed(4)}</p></div>
          <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500">Megapixels</p><p className="font-bold text-gray-800">{megapixels}MP</p></div>
        </div>
      </div>
    </ToolLayout>
  )
}