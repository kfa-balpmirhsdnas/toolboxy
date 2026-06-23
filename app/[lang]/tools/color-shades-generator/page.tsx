'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function hexToRgb(hex){const m=hex.replace('#','').match(/.{2}/g);return m?{r:parseInt(m[0],16),g:parseInt(m[1],16),b:parseInt(m[2],16)}:{r:0,g:0,b:0}}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('')}
function mixWith(base,mix,steps,total){
  return Array.from({length:steps},(_,i)=>{
    const t=i/total
    return rgbToHex(base.r+(mix[0]-base.r)*t,base.g+(mix[1]-base.g)*t,base.b+(mix[2]-base.b)*t)
  })
}
export default function Page(){
  const [base,setBase]=useState('#3b82f6')
  const [steps,setSteps]=useState(5)
  const [copied,setCopied]=useState('')
  const rgb=hexToRgb(base)
  const lights=mixWith(rgb,[255,255,255],steps+1,steps+1).slice(1).reverse()
  const darks=mixWith(rgb,[0,0,0],steps+1,steps+1).slice(1)
  const allColors=[...lights,base,...darks]
  const copyAll=()=>{const all=allColors.join(', ');navigator.clipboard?.writeText(all);setCopied('all')}
  const tool=TOOLS.find(t=>t.slug==='color-shades-generator')
  const renderSwatches=(colors,title)=>(
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c,i)=>(
          <button key={i} onClick={()=>{navigator.clipboard?.writeText(c);setCopied(c)}} title={c}
            className={'flex flex-col items-center gap-1 '+(copied===c?'ring-2 ring-offset-1 ring-blue-500 rounded':'')}>
            <div className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm" style={{backgroundColor:c}}/>
            <span className="text-xs font-mono text-gray-500">{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">Base Color
            <input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-10 h-10 rounded cursor-pointer"/></label>
          <label className="flex items-center gap-2 text-sm text-gray-700">Steps
            <input type="number" min={2} max={10} value={steps} onChange={e=>setSteps(+e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"/></label>
          <button onClick={copyAll} className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{copied==='all'?'Copied!':'Copy All'}</button>
        </div>
        {renderSwatches(lights,'Tints (lighter)')}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200"/>
          <div className="w-16 h-16 rounded-xl border-2 border-gray-300 shadow" style={{backgroundColor:base}}/>
          <span className="font-mono text-sm text-gray-700">{base.toUpperCase()}</span>
          <div className="flex-1 h-px bg-gray-200"/>
        </div>
        {renderSwatches(darks,'Shades (darker)')}
      </div>
    </ToolLayout>
  )
}