'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-shades-generator')!
function hexToRgb(hex:string){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{r,g,b}}
function rgbToHex(r:number,g:number,b:number){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mixWith(hex:string,target:number[],steps:number,count:number){
  const {r,g,b}=hexToRgb(hex)
  return Array.from({length:count},(_,i)=>{
    const t=(i+1)/steps
    return rgbToHex(r+(target[0]-r)*t,g+(target[1]-g)*t,b+(target[2]-b)*t)
  })
}
function getLuminance(hex:string){const{r,g,b}=hexToRgb(hex);return(0.299*r+0.587*g+0.114*b)/255}
export default function ColorShadesGeneratorPage() {
  const [base,setBase]=useState('#3b82f6')
  const [steps,setSteps]=useState(9)
  const [copied,setCopied]=useState('')
  const shades=[...mixWith(base,[255,255,255],steps+1,steps).reverse(),base,...mixWith(base,[0,0,0],steps+1,steps)]
  const allColors=[...shades]
  const tints=mixWith(base,[255,255,255],steps+1,steps).reverse()
  const tones=mixWith(base,[128,128,128],steps+1,steps)
  const shades2=mixWith(base,[0,0,0],steps+1,steps)
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1000)}
  const copyAll=()=>{const all=allColors.join('
');navigator.clipboard.writeText(all);setCopied('all')}
  const Section=({title,colors}:{title:string;colors:string[]})=>(
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">{title}</p>
      <div className="flex gap-1 flex-wrap">
        {colors.map((c,i)=>(
          <button key={i} onClick={()=>copy(c)} title={c}
            className="flex flex-col items-center gap-1 group transition">
            <div style={{backgroundColor:c}} className="w-12 h-12 rounded-lg shadow-sm border border-black/5 hover:scale-105 transition"/>
            <span style={{color:getLuminance(c)>0.5?'#374151':'#6B7280'}} className="text-xs font-mono" style={{color:'#374151'}}>{copied===c?'✓':c.slice(1).toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-14 h-10 rounded-xl border border-gray-300 cursor-pointer p-0.5"/>
            <input value={base} onChange={e=>setBase(e.target.value)} className="w-28 rounded-xl border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:outline-none focus:border-blue-400"/>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Steps:</label>
            <select value={steps} onChange={e=>setSteps(Number(e.target.value))} className="rounded border border-gray-300 px-2 py-1.5 text-sm">
              {[5,7,9,11].map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={copyAll} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
            {copied==='all'?'Copied!':'Copy all hex'}
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
          <Section title="Tints (mix with white)" colors={tints}/>
          <Section title="Tones (mix with gray)" colors={tones}/>
          <Section title="Shades (mix with black)" colors={shades2}/>
        </div>
      </div>
    </ToolLayout>
  )
}