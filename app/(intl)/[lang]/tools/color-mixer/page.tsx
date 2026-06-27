'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-mixer')!
type Rgb=[number,number,number]
function hexToRgb(hex:string):Rgb{const m=hex.replace('#','').match(/.{2}/g);return m?m.map(x=>parseInt(x,16)) as Rgb:[0,0,0]}
function rgbToHex([r,g,b]:Rgb):string{return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
function mix(c1:Rgb,c2:Rgb,t:number):Rgb{return c1.map((v,i)=>v+(c2[i]-v)*t) as Rgb}
function hslStr([r,g,b]:Rgb):string{
  const r1=r/255,g1=g/255,b1=b/255
  const max=Math.max(r1,g1,b1),min=Math.min(r1,g1,b1)
  const l=(max+min)/2
  if(max===min)return 'hsl(0, 0%, '+Math.round(l*100)+'%)'
  const d=max-min,s=l>0.5?d/(2-max-min):d/(max+min)
  let h=max===r1?(g1-b1)/d+(g1<b1?6:0):max===g1?(b1-r1)/d+2:(r1-g1)/d+4
  return 'hsl('+Math.round(h*60)+', '+Math.round(s*100)+'%, '+Math.round(l*100)+'%)'
}
export default function ColorMixerPage() {
  const t = useTranslations('toolui')
  const [c1,setC1]=useState('#6366f1')
  const [c2,setC2]=useState('#ec4899')
  const [steps,setSteps]=useState(7)
  const rgb1=hexToRgb(c1),rgb2=hexToRgb(c2)
  const swatches=Array.from({length:steps},(_,i)=>rgbToHex(mix(rgb1,rgb2,i/(steps-1))))
  const [copied,setCopied]=useState('')
  const copy=(h:string)=>{navigator.clipboard.writeText(h);setCopied(h);setTimeout(()=>setCopied(''),1200)}
  const midHex=swatches[Math.floor(steps/2)]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('cmx_c1')}</label>
            <div className="flex gap-2">
              <input type="color" value={c1} onChange={e=>setC1(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={c1} onChange={e=>setC1(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 font-mono text-sm uppercase"/>
            </div>
          </div>
          <div className="py-2 text-gray-400 font-bold text-xl">+</div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('cmx_c2')}</label>
            <div className="flex gap-2">
              <input type="color" value={c2} onChange={e=>setC2(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={c2} onChange={e=>setC2(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 font-mono text-sm uppercase"/>
            </div>
          </div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">{t('cmx_steps')}: {steps}</label>
          <input type="range" min="3" max="15" value={steps} onChange={e=>setSteps(Number(e.target.value))} className="w-full"/></div>
        <div className="flex gap-1.5">
          {swatches.map((h,i)=>(
            <button key={i} onClick={()=>copy(h)} className="flex-1 rounded-xl overflow-hidden group" title={h}>
              <div className="h-16" style={{background:h}}/>
              <div className="py-1 text-center"><p className="text-xs font-mono text-gray-600 group-hover:text-blue-600 truncate">{copied===h?'✓':h.toUpperCase()}</p></div>
            </button>
          ))}
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">{t('cmx_mid')}</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg" style={{background:midHex}}/>
            <div className="text-left">
              <p className="font-mono text-sm font-bold text-gray-800">{midHex.toUpperCase()}</p>
              <p className="font-mono text-xs text-gray-500">{hslStr(hexToRgb(midHex))}</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}