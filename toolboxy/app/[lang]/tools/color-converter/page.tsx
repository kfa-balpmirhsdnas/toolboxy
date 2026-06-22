'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-converter')!
function hexToRgb(hex: string) {
  const c=hex.replace('#','')
  if(!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(c))return null
  const f=c.length===3?c.split('').map(x=>x+x).join(''):c
  return {r:parseInt(f.slice(0,2),16),g:parseInt(f.slice(2,4),16),b:parseInt(f.slice(4,6),16)}
}
function rgbToHex(r: number,g: number,b: number) {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('')
}
function rgbToHsl(r: number,g: number,b: number) {
  const rf=r/255,gf=g/255,bf=b/255,max=Math.max(rf,gf,bf),min=Math.min(rf,gf,bf),l=(max+min)/2
  if(max===min)return{h:0,s:0,l:Math.round(l*100)}
  const d=max-min,s=l>0.5?d/(2-max-min):d/(max+min)
  let h=0
  if(max===rf)h=((gf-bf)/d+(gf<bf?6:0))/6
  else if(max===gf)h=((bf-rf)/d+2)/6
  else h=((rf-gf)/d+4)/6
  return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}
}
function hslToRgb(h: number,s: number,l: number) {
  const sf=s/100,lf=l/100
  if(sf===0){const v=Math.round(lf*255);return{r:v,g:v,b:v}}
  const q=lf<0.5?lf*(1+sf):lf+sf-lf*sf,p=2*lf-q
  const hue=(t: number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
  const hf=h/360
  return{r:Math.round(hue(hf+1/3)*255),g:Math.round(hue(hf)*255),b:Math.round(hue(hf-1/3)*255)}
}
export default function ColorConverterPage({ params }: { params: { lang: string } }) {
  const [hex, setHex] = useState('#3b82f6')
  const [copied, setCopied] = useState<string|null>(null)
  const rgb=hexToRgb(hex)??{r:59,g:130,b:246}
  const hsl=rgbToHsl(rgb.r,rgb.g,rgb.b)
  const isValid=hexToRgb(hex)!==null
  const dHex=isValid?hex:'#3b82f6'
  const handleRgb=(k: 'r'|'g'|'b',v: string)=>{const n=Math.max(0,Math.min(255,parseInt(v)||0));setHex(rgbToHex({...rgb,[k]:n}.r,{...rgb,[k]:n}.g,{...rgb,[k]:n}.b))}
  const handleHsl=(k: 'h'|'s'|'l',v: string)=>{const mx=k==='h'?360:100;const n=Math.max(0,Math.min(mx,parseInt(v)||0));const nh={...hsl,[k]:n};const nr=hslToRgb(nh.h,nh.s,nh.l);setHex(rgbToHex(nr.r,nr.g,nr.b))}
  async function copy(text: string){await navigator.clipboard.writeText(text);setCopied(text);setTimeout(()=>setCopied(null),1500)}
  const formats=[{label:'HEX',value:dHex.toUpperCase()},{label:'RGB',value:`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`},{label:'HSL',value:`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`},{label:'CSS',value:`color: ${dHex.toUpperCase()};`}]
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="w-24 h-24 rounded-2xl border border-gray-200 shrink-0 cursor-pointer relative overflow-hidden" style={{backgroundColor:dHex}}><input type="color" value={dHex} onChange={e=>setHex(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" /></div>
          <div className="flex-1"><label className="text-xs text-gray-500 font-medium">HEX</label><input value={hex} onChange={e=>setHex(e.target.value)} className={`mt-1 w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 ${isValid?'border-gray-200':'border-red-300'}`} placeholder="#000000" /></div>
        </div>
        <div><p className="text-xs text-gray-500 font-medium mb-2">RGB</p><div className="grid grid-cols-3 gap-2">{(['r','g','b'] as const).map(k=>(<div key={k}><label className="text-xs text-gray-400 uppercase">{k}</label><input type="number" min={0} max={255} value={rgb[k]} onChange={e=>handleRgb(k,e.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 text-center" /></div>))}</div></div>
        <div><p className="text-xs text-gray-500 font-medium mb-2">HSL</p><div className="grid grid-cols-3 gap-2">{(['h','s','l'] as const).map(k=>(<div key={k}><label className="text-xs text-gray-400 uppercase">{k}{k!=='h'?' (%)':' (°)'}</label><input type="number" min={0} max={k==='h'?360:100} value={hsl[k]} onChange={e=>handleHsl(k,e.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 text-center" /></div>))}</div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{formats.map(f=>(<div key={f.label} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"><span className="text-xs text-gray-400 w-10 shrink-0">{f.label}</span><code className="flex-1 text-sm font-mono text-gray-800 truncate">{f.value}</code><button onClick={()=>copy(f.value)} className="shrink-0 text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors">{copied===f.value?'✓':'Copy'}</button></div>))}</div>
      </div>
    </ToolLayout>
  )
}