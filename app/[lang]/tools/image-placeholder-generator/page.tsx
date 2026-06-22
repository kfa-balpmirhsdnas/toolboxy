'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('image-placeholder-generator')!
const PRESETS=[{label:'16:9',w:1280,h:720},{label:'4:3',w:800,h:600},{label:'1:1',w:500,h:500},{label:'Profile',w:200,h:200},{label:'Banner',w:728,h:90},{label:'OG',w:1200,h:630},{label:'Thumbnail',w:320,h:180}]
export default function ImagePlaceholderGeneratorPage() {
  const [w,setW]=useState(400)
  const [h,setH]=useState(300)
  const [bg,setBg]=useState('#cccccc')
  const [fg,setFg]=useState('#666666')
  const [text,setText]=useState('')
  const [format,setFormat]=useState<'svg'|'url'>('svg')
  const displayText=text||(w+'x'+h)
  const svgStr='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><rect width="100%" height="100%" fill="'+bg+'"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="'+Math.max(12,Math.min(w,h)/8)+'px" fill="'+fg+'">'+displayText+'</text></svg>'
  const dataUrl='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgStr)
  const placehold='https://placehold.co/'+w+'x'+h+'/'+bg.replace('#','')+'/'+fg.replace('#','')+'?text='+encodeURIComponent(displayText)
  const [copied,setCopied]=useState('')
  const copy=(v:string,k:string)=>{navigator.clipboard.writeText(v);setCopied(k);setTimeout(()=>setCopied(''),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setW(p.w);setH(p.h)}}
              className={'px-3 py-1.5 rounded-full border text-xs font-medium transition '+(w===p.w&&h===p.h?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>
              {p.label} ({p.w}x{p.h})
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Width (px)</label>
            <input type="number" min="1" max="2000" value={w} onChange={e=>setW(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Height (px)</label>
            <input type="number" min="1" max="2000" value={h} onChange={e=>setH(Number(e.target.value))} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
            <div className="flex gap-1"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 rounded border border-gray-300 px-1.5 py-1 text-xs font-mono"/></div></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Text color</label>
            <div className="flex gap-1"><input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={fg} onChange={e=>setFg(e.target.value)} className="flex-1 rounded border border-gray-300 px-1.5 py-1 text-xs font-mono"/></div></div>
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Custom text (optional)</label>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder={w+'x'+h} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"/></div>
        <div className="flex justify-center" style={{maxHeight:'200px',overflow:'hidden'}}>
          <img src={dataUrl} style={{maxWidth:'100%',maxHeight:'200px',objectFit:'contain'}} alt="placeholder preview"/>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500 w-16">Data URL</span>
            <code className="flex-1 text-xs font-mono text-gray-700 truncate">{dataUrl.slice(0,60)}...</code>
            <button onClick={()=>copy(dataUrl,'data')} className="text-xs text-blue-600 hover:underline whitespace-nowrap">{copied==='data'?'Copied!':'Copy'}</button>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500 w-16">placehold.co</span>
            <code className="flex-1 text-xs font-mono text-gray-700 truncate">{placehold}</code>
            <button onClick={()=>copy(placehold,'url')} className="text-xs text-blue-600 hover:underline whitespace-nowrap">{copied==='url'?'Copied!':'Copy'}</button>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500 w-16">HTML img</span>
            <code className="flex-1 text-xs font-mono text-gray-700 truncate">{'<img src="'+placehold+'" alt="placeholder" />'}</code>
            <button onClick={()=>copy('<img src="'+placehold+'" alt="placeholder" />','html')} className="text-xs text-blue-600 hover:underline whitespace-nowrap">{copied==='html'?'Copied!':'Copy'}</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}