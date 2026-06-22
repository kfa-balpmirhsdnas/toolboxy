'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('aspect-ratio-calculator')!
const PRESETS = [{l:'16:9',w:1920,h:1080},{l:'4:3',w:1024,h:768},{l:'1:1',w:1000,h:1000},{l:'21:9',w:2560,h:1080},{l:'3:2',w:1500,h:1000}]
function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}
export default function AspectRatioCalculatorPage() {
  const [w,setW]=useState('1920')
  const [h,setH]=useState('1080')
  const [tw,setTw]=useState('')
  const [th,setTh]=useState('')
  const nw=parseInt(w)||0,nh=parseInt(h)||0
  const d=nw&&nh?gcd(nw,nh):1
  const ratio=nw&&nh?(nw/d)+':'+(nh/d):''
  const dec=nw&&nh?(nw/nh).toFixed(4):''
  const scaledW=tw&&nw&&nh?{w:parseInt(tw),h:Math.round(parseInt(tw)*nh/nw)}:null
  const scaledH=th&&nw&&nh?{h:parseInt(th),w:Math.round(parseInt(th)*nw/nh)}:null
  const scaled=scaledW||scaledH
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p=>(
              <button key={p.l} onClick={()=>{setW(String(p.w));setH(String(p.h));setTw('');setTh('')}}
                className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100">{p.l}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
            <input type="number" value={w} onChange={e=>setW(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
            <input type="number" value={h} onChange={e=>setH(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        {ratio&&<div className="bg-blue-50 rounded-xl p-5 text-center">
          <p className="text-4xl font-bold text-blue-700">{ratio}</p>
          <p className="text-sm text-gray-500 mt-1">Decimal: {dec} &middot; {w} x {h} px</p>
        </div>}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Scale to new size (maintain ratio)</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">New Width</label>
              <input type="number" value={tw} onChange={e=>{setTw(e.target.value);setTh('')}} placeholder="e.g. 800" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">New Height</label>
              <input type="number" value={th} onChange={e=>{setTh(e.target.value);setTw('')}} placeholder="e.g. 450" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          </div>
          {scaled&&<div className="mt-3 bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xl font-semibold text-green-700">{scaled.w} x {scaled.h} px</p>
          </div>}
        </div>
      </div>
    </ToolLayout>
  )
}