'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-palette-generator')!
function hexToHsl(h:string):[number,number,number]{
  const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2
  if(max===min)return[0,0,Math.round(l*100)]
  const d=max-min,s=l>0.5?d/(2-max-min):d/(max+min)
  let hue=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4
  return[Math.round(hue/6*360),Math.round(s*100),Math.round(l*100)]
}
function hslToHex(h:number,s:number,l:number):string{
  s/=100;l/=100
  const a=s*Math.min(l,1-l)
  const f=(n:number)=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0')}
  return '#'+f(0)+f(8)+f(4)
}
function getShades(hex:string,count:number):string[]{
  const [h,s]=hexToHsl(hex)
  const step=80/count
  return Array.from({length:count},(_,i)=>hslToHex(h,s,Math.round(5+step*i)))
}
function getComplementary(hex:string):string[]{
  const [h,s,l]=hexToHsl(hex)
  return [[h,s,l],[( h+30)%360,s,l],[(h+60)%360,s,l],[(h+120)%360,s,l],[(h+180)%360,s,l],[(h+240)%360,s,l]].map(([a,b,c])=>hslToHex(a,b,c))
}
function isLight(hex:string):boolean{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(0.299*r+0.587*g+0.114*b)>128}
export default function ColorPaletteGeneratorPage() {
  const [base,setBase]=useState('#6366f1')
  const [paletteMode,setPaletteMode]=useState<'shades'|'complementary'|'analogous'>('shades')
  const [copied,setCopied]=useState('')
  const shadeCount=10
  const palette=paletteMode==='shades'?getShades(base,shadeCount):getComplementary(base)
  const copy=(h:string)=>{navigator.clipboard.writeText(h);setCopied(h);setTimeout(()=>setCopied(''),1500)}
  const copyAll=()=>{navigator.clipboard.writeText(palette.join('
'));setCopied('all');setTimeout(()=>setCopied(''),1500)}
  const [h,s,l]=hexToHsl(base)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-14 h-12 rounded border border-gray-300 cursor-pointer p-0.5"/>
            <div>
              <input value={base} onChange={e=>setBase(e.target.value)} className="block w-24 rounded border border-gray-300 px-2 py-1 font-mono text-sm"/>
              <p className="text-xs text-gray-400 mt-0.5">hsl({h},{s}%,{l}%)</p>
            </div>
          </div>
          <div className="flex rounded overflow-hidden border border-gray-300 ml-2">
            {([['shades','Shades'],['complementary','Complementary'],['analogous','Analogous']] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setPaletteMode(id)}
                className={'px-3 py-2 text-xs font-medium transition '+(paletteMode===id?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-end h-24 rounded-xl overflow-hidden">
          {palette.map((c,i)=>(
            <div key={i} className="flex-1 h-full flex items-end justify-center pb-1 cursor-pointer transition hover:flex-[1.3]"
              style={{background:c}} onClick={()=>copy(c)} title={c}>
              <span className="text-xs font-mono opacity-0 hover:opacity-100 transition" style={{color:isLight(c)?'#374151':'#f9fafb'}}>{copied===c?'OK':''}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {palette.map((c,i)=>(
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{background:c}}/>
              <code className="flex-1 font-mono text-sm text-gray-700">{c.toUpperCase()}</code>
              {paletteMode==='shades'&&<span className="text-xs text-gray-400 w-16">{(i+1)*Math.floor(900/palette.length)}</span>}
              <button onClick={()=>copy(c)} className="text-xs text-blue-600 hover:underline w-12">{copied===c?'Copied!':'Copy'}</button>
            </div>
          ))}
        </div>
        <button onClick={copyAll} className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">{copied==='all'?'Copied all!':'Copy all HEX values'}</button>
      </div>
    </ToolLayout>
  )
}