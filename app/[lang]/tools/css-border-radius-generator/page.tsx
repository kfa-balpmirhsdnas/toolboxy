'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-border-radius-generator')!
const PRESETS=[{name:'None',v:[0,0,0,0]},{name:'Slight',v:[4,4,4,4]},{name:'Medium',v:[8,8,8,8]},{name:'Round',v:[16,16,16,16]},{name:'Pill',v:[9999,9999,9999,9999]},{name:'Circle',v:[50,50,50,50]},{name:'Leaf',v:[0,50,0,50]},{name:'Ticket',v:[50,4,50,4]}]
export default function CssBorderRadiusGeneratorPage() {
  const [tl,setTl]=useState(16)
  const [tr,setTr]=useState(16)
  const [br,setBr]=useState(16)
  const [bl,setBl]=useState(16)
  const [unit,setUnit]=useState<'px'|'%'>('px')
  const [linked,setLinked]=useState(false)
  const [copied,setCopied]=useState(false)
  const u=(v:number)=>unit==='%'?Math.min(v,50)+'%':v+'px'
  const css='border-radius: '+u(tl)+' '+u(tr)+' '+u(br)+' '+u(bl)+';'
  const isShorthand=tl===tr&&tr===br&&br===bl
  const shortCss=isShorthand?'border-radius: '+u(tl)+';':css
  const setAll=(v:number)=>{setTl(v);setTr(v);setBr(v);setBl(v)}
  const copy=()=>{navigator.clipboard.writeText(shortCss);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const Slider=({label,val,set}:{label:string;val:number;set:(v:number)=>void})=>(
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono text-blue-600">{val}{unit}</span>
      </div>
      <input type="range" min="0" max={unit==='%'?50:100} value={val}
        onChange={e=>{const v=Number(e.target.value);linked?setAll(v):set(v)}} className="w-full"/>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.name} onClick={()=>{setTl(p.v[0]);setTr(p.v[1]);setBr(p.v[2]);setBl(p.v[3])}}
              className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{p.name}</button>
          ))}
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex rounded overflow-hidden border border-gray-300">
            {(['px','%'] as const).map(u=>(
              <button key={u} onClick={()=>setUnit(u)}
                className={'px-3 py-1.5 text-sm font-medium transition '+(unit===u?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{u}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={linked} onChange={e=>setLinked(e.target.checked)} className="rounded"/>
            Link all corners
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Slider label="Top Left" val={tl} set={setTl}/>
          <Slider label="Top Right" val={tr} set={setTr}/>
          <Slider label="Bottom Left" val={bl} set={setBl}/>
          <Slider label="Bottom Right" val={br} set={setBr}/>
        </div>
        <div className="flex justify-center py-4">
          <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600"
            style={{borderRadius:u(tl)+' '+u(tr)+' '+u(br)+' '+u(bl)}}/>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-3">
          <code className="text-green-400 font-mono text-sm">{shortCss}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}