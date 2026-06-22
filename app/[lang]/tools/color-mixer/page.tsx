'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-mixer')!
function hexToRgb(h:string):[number,number,number]{
  const r=h.replace('#','')
  return [parseInt(r.slice(0,2),16),parseInt(r.slice(2,4),16),parseInt(r.slice(4,6),16)]
}
function rgbToHex(r:number,g:number,b:number):string{
  return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')
}
function mixColors(c1:string,c2:string,ratio:number):string{
  const [r1,g1,b1]=hexToRgb(c1)
  const [r2,g2,b2]=hexToRgb(c2)
  const t=ratio/100
  return rgbToHex(r1*(1-t)+r2*t,g1*(1-t)+g2*t,b1*(1-t)+b2*t)
}
function luminance(r:number,g:number,b:number):number{
  const [rs,gs,bs]=[r,g,b].map(c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)})
  return 0.2126*rs+0.7152*gs+0.0722*bs
}
function contrastRatio(hex:string):string{
  const [r,g,b]=hexToRgb(hex)
  const L=luminance(r,g,b)
  const white=1,black=0
  return ((white+0.05)/(L+0.05)).toFixed(2)
}
export default function ColorMixerPage() {
  const [c1,setC1]=useState('#3b82f6')
  const [c2,setC2]=useState('#ef4444')
  const [ratio,setRatio]=useState(50)
  const [copied,setCopied]=useState('')
  const mixed=mixColors(c1,c2,ratio)
  const [mr,mg,mb]=hexToRgb(mixed)
  const copy=(val:string,k:string)=>{navigator.clipboard.writeText(val);setCopied(k);setTimeout(()=>setCopied(''),1500)}
  const STEPS=[0,25,50,75,100]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[{label:'Color 1',val:c1,set:setC1},{label:'Color 2',val:c2,set:setC2}].map(({label,val,set})=>(
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="flex gap-2">
                <input type="color" value={val} onChange={e=>set(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
                <input value={val} onChange={e=>set(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-sm uppercase"/>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Color 1 ({100-ratio}%)</span>
            <span>Color 2 ({ratio}%)</span>
          </div>
          <input type="range" min="0" max="100" value={ratio} onChange={e=>setRatio(Number(e.target.value))} className="w-full"/>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="h-24 flex">
            <div style={{background:c1,flex:100-ratio}}/>
            <div style={{background:mixed,flex:10,minWidth:'60px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span className="text-white text-xs font-bold text-shadow" style={{textShadow:'0 1px 3px rgba(0,0,0,0.5)'}}>Mix</span>
            </div>
            <div style={{background:c2,flex:ratio}}/>
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border-2 border-gray-200 flex-shrink-0" style={{background:mixed}}/>
              <div>
                <p className="font-mono font-bold text-gray-800">{mixed.toUpperCase()}</p>
                <p className="text-xs text-gray-500">rgb({mr}, {mg}, {mb})</p>
                <p className="text-xs text-gray-400">Contrast ratio (vs white): {contrastRatio(mixed)}</p>
              </div>
              <button onClick={()=>copy(mixed,'hex')} className="ml-auto text-xs text-blue-600 hover:underline whitespace-nowrap">
                {copied==='hex'?'Copied!':'Copy HEX'}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {STEPS.map(s=>{const m=mixColors(c1,c2,s);return(
            <div key={s} className="text-center">
              <div className="h-8 rounded" style={{background:m}}/>
              <p className="text-xs font-mono mt-1 text-gray-600">{m}</p>
            </div>
          )})}
        </div>
      </div>
    </ToolLayout>
  )
}