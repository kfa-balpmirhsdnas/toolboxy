'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-shades-generator')!
function h2r(hex){return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}}
function r2h(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mix(hex,t,steps,n){const {r,g,b}=h2r(hex);return Array.from({length:n},(_,i)=>{const p=(i+1)/steps;return r2h(r+(t[0]-r)*p,g+(t[1]-g)*p,b+(t[2]-b)*p)})}
export default function ColorShadesGeneratorPage() {
  const [base,setBase]=useState('#3b82f6')
  const [steps,setSteps]=useState(9)
  const [copied,setCopied]=useState('')
  const tints=mix(base,[255,255,255],steps+1,steps).reverse()
  const tones=mix(base,[128,128,128],steps+1,steps)
  const shades=mix(base,[0,0,0],steps+1,steps)
  const all=[...tints,base,...shades]
  const cp=(hex)=>{navigator.clipboard.writeText(hex);setCopied(hex);setTimeout(()=>setCopied(''),2000)}
  const cpAll=()=>{navigator.clipboard.writeText(all.join('\n'));setCopied('all');setTimeout(()=>setCopied(''),2000)}
  const Row=({title,colors})=>(<div><p className="text-xs font-semibold text-gray-600 mb-2">{title}</p><div className="flex flex-wrap gap-2">{colors.map((hex,i)=>(<button key={i} onClick={()=>cp(hex)} title={hex} className="w-12 h-12 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform" style={{background:hex}}/>))}</div></div>)
  return (<ToolLayout tool={tool}><div className="max-w-2xl mx-auto px-4 space-y-6"><div className="flex flex-wrap gap-4 items-end"><div><label className="block text-sm font-medium text-gray-700 mb-1">Base Color</label><div className="flex gap-2 items-center"><input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-16 h-10 rounded border cursor-pointer"/><span className="font-mono text-sm">{base}</span></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Steps: {steps}</label><input type="range" min={3} max={12} value={steps} onChange={e=>setSteps(Number(e.target.value))} className="w-32"/></div><button onClick={cpAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{copied==='all'?'Copied!':'Copy All'}</button></div><div className="space-y-4"><Row title="Tints" colors={tints}/><Row title="Base" colors={[base]}/><Row title="Tones" colors={tones}/><Row title="Shades" colors={shades}/></div></div></ToolLayout>)
}