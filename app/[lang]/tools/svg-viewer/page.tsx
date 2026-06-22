'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('svg-viewer')!
const SAMPLE=`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="80" fill="url(#grad)" opacity="0.9"/>
  <circle cx="100" cy="100" r="50" fill="white" opacity="0.3"/>
  <text x="100" y="108" font-size="28" text-anchor="middle" fill="white" font-weight="bold">SVG</text>
</svg>`
export default function SvgViewerPage() {
  const [code,setCode]=useState(SAMPLE)
  const [bg,setBg]=useState<'white'|'black'|'checker'>('white')
  const [zoom,setZoom]=useState(100)
  const [copied,setCopied]=useState('')
  const dataUrl='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(code)
  const copy=(t:'svg'|'dataUrl')=>{navigator.clipboard.writeText(t==='svg'?code:dataUrl);setCopied(t);setTimeout(()=>setCopied(''),1200)}
  const download=(ext:'svg'|'png')=>{
    if(ext==='svg'){const a=document.createElement('a');a.href=dataUrl;a.download='image.svg';a.click();return}
    const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx!.drawImage(img,0,0);const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='image.png';a.click()};img.src=dataUrl
  }
  const bgClass=bg==='white'?'bg-white':bg==='black'?'bg-gray-900':'bg-[length:20px_20px] bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%),linear-gradient(45deg,#e5e7eb_25%,white_25%,white_75%,#e5e7eb_75%)] bg-[position:0_0,10px_10px]'
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 h-72">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">SVG code</label>
            <textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full h-64 rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
            <div className={'h-64 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden '+bgClass}>
              <div style={{transform:'scale('+(zoom/100)+')',transformOrigin:'center'}} dangerouslySetInnerHTML={{__html:code}}/>
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex gap-1">
            {(['white','black','checker'] as const).map(b=>(
              <button key={b} onClick={()=>setBg(b)}
                className={'px-2.5 py-1.5 rounded-lg border text-xs capitalize font-medium transition '+(bg===b?'bg-gray-800 text-white border-gray-800':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{b}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Zoom:</span>
            <input type="range" min="25" max="200" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="w-24"/>
            <span className="text-xs font-mono text-gray-600 w-10">{zoom}%</span>
          </div>
          <div className="flex gap-1.5 ml-auto">
            <button onClick={()=>copy('svg')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">{copied==='svg'?'✓ Copied':'Copy SVG'}</button>
            <button onClick={()=>download('svg')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Download SVG</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}