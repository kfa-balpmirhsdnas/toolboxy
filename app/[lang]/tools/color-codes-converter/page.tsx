'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('color-codes-converter')!

function hexToRgb(hex: string): [number,number,number]|null {
  const h = hex.replace('#','')
  const full = h.length===3 ? h.split('').map(c=>c+c).join('') : h
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const n = parseInt(full,16)
  return [(n>>16)&255,(n>>8)&255,n&255]
}
function rgbToHex(r:number,g:number,b:number):string {
  return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('')
}
function rgbToHsl(r:number,g:number,b:number):[number,number,number]{
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h=0,s=0;const l=(max+min)/2;
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}
function hslToRgb(h:number,s:number,l:number):[number,number,number]{
  h/=360;s/=100;l/=100;
  let r,g,b;
  if(s===0){r=g=b=l}else{
    const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
    const hue=(t:number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
    r=hue(h+1/3);g=hue(h);b=hue(h-1/3)
  }
  return [Math.round(r*255),Math.round(g*255),Math.round(b*255)]
}

export default function ColorCodesConverterPage({ params }: { params: { lang: string } }) {
  const [hex, setHex] = useState('#6366f1')
  const [rgb, setRgb] = useState<[number,number,number]>([99,102,241])
  const [hsl, setHsl] = useState<[number,number,number]>([239,84,67])
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('color-codes-converter'); tracked.current = true } }

  function fromHex(v: string) {
    setHex(v); track()
    const r = hexToRgb(v)
    if (r) { setRgb(r); setHsl(rgbToHsl(...r)) }
  }
  function fromRgb(r:number,g:number,b:number) {
    setRgb([r,g,b]); track()
    setHex(rgbToHex(r,g,b)); setHsl(rgbToHsl(r,g,b))
  }
  function fromHsl(h:number,s:number,l:number) {
    setHsl([h,s,l]); track()
    const r = hslToRgb(h,s,l); setRgb(r); setHex(rgbToHex(...r))
  }

  async function copy(val:string,id:string) {
    await navigator.clipboard.writeText(val); trackToolCopy('color-codes-converter'); setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const preview = hex
  const hexStr = hex
  const rgbStr = 'rgb('+rgb.join(', ')+')'
  const hslStr = 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <input type="color" value={hex} onChange={e=>fromHex(e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border border-gray-200" />
          <div className="flex-1 h-16 rounded-2xl border border-gray-200" style={{ background: preview }} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="w-12 text-xs font-semibold text-gray-600">HEX</label>
            <input value={hex} onChange={e=>fromHex(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={()=>copy(hexStr,'hex')} className="text-xs text-brand-600 hover:underline w-12">{copied==='hex'?'\u2713':'Copy'}</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-12 text-xs font-semibold text-gray-600">RGB</label>
            <div className="flex-1 grid grid-cols-3 gap-1">
              {['R','G','B'].map((label,i)=>(
                <div key={label} className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <input type="number" min={0} max={255} value={rgb[i]} onChange={e=>{const v=[...rgb] as [number,number,number];v[i]=Math.max(0,Math.min(255,parseInt(e.target.value)||0));fromRgb(...v)}}
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              ))}
            </div>
            <button onClick={()=>copy(rgbStr,'rgb')} className="text-xs text-brand-600 hover:underline w-12">{copied==='rgb'?'\u2713':'Copy'}</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-12 text-xs font-semibold text-gray-600">HSL</label>
            <div className="flex-1 grid grid-cols-3 gap-1">
              {[['H',360],['S',100],['L',100]].map(([label,max],i)=>(
                <div key={String(label)} className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <input type="number" min={0} max={Number(max)} value={hsl[i]} onChange={e=>{const v=[...hsl] as [number,number,number];v[i]=Math.max(0,Math.min(Number(max),parseInt(e.target.value)||0));fromHsl(...v)}}
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              ))}
            </div>
            <button onClick={()=>copy(hslStr,'hsl')} className="text-xs text-brand-600 hover:underline w-12">{copied==='hsl'?'\u2713':'Copy'}</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
