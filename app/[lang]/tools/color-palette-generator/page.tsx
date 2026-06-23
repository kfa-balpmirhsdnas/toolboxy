'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-palette-generator')!
function h2rgb(hex){return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}}
function h2hsl(hex){let {r,g,b}=h2rgb(hex);r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;if(max===min)return [0,0,Math.round(l*100)];const d=max-min,s=l>0.5?d/(2-max-min):d/(max+min),h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;return [Math.round(h/6*360),Math.round(s*100),Math.round(l*100)]}
function hsl2h(h,s,l){const sl=s/100,ll=l/100,a=sl*Math.min(ll,1-ll);const f=n=>{const k=(n+h/30)%12,c=ll-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)}
function getShades(hex,n){const [h,s]=h2hsl(hex);return Array.from({length:n},(_,i)=>hsl2h(h,s,Math.round(10+i*(80/n))))}
function getComp(hex){const [h,s,l]=h2hsl(hex);return Array.from({length:5},(_,i)=>hsl2h((h+i*72)%360,s,l))}
function getAnal(hex){const [h,s,l]=h2hsl(hex);return Array.from({length:5},(_,i)=>hsl2h((h-40+i*20+360)%360,s,l))}
export default function ColorPaletteGeneratorPage() {
  const [base,setBase]=useState('#6366f1')
  const [mode,setMode]=useState('shades')
  const [cp,setCp]=useState('')
  const pal=mode==='shades'?getShades(base,10):mode==='comp'?getComp(base):getAnal(base)
  const copy=(h)=>{navigator.clipboard.writeText(h);setCp(h);setTimeout(()=>setCp(''),2000)}
  const copyAll=()=>{navigator.clipboard.writeText(pal.join('\n'));setCp('all');setTimeout(()=>setCp(''),2000)}
  return (<ToolLayout tool={tool}><div className="max-w-lg mx-auto px-4 space-y-5"><div className="flex flex-wrap gap-3 items-center"><input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-14 h-12 rounded border cursor-pointer"/><span className="font-mono text-sm font-bold">{base}</span><div className="flex gap-2 ml-auto">{[{v:'shades',l:'Shades'},{v:'comp',l:'Complementary'},{v:'anal',l:'Analogous'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} className={`px-3 py-1.5 text-xs rounded-lg border ${mode===m.v?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-300'}`}>{m.l}</button>))}</div></div><div className="flex flex-wrap gap-3">{pal.map((hex,i)=>(<button key={i} onClick={()=>copy(hex)} className="flex flex-col items-center gap-1"><div className="w-14 h-14 rounded-xl shadow border-2 border-white hover:scale-110 transition-transform" style={{background:hex}}/><span className="text-xs font-mono text-gray-600">{hex}</span></button>))}</div><button onClick={copyAll} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">{cp==='all'?'Copied!':'Copy All'}</button></div></ToolLayout>)
}