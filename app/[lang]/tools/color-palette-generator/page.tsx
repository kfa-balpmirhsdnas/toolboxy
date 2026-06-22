'use client'
import { useState } from 'react'

function hexToHsl(hex:string):[number,number,number]{
  const r=parseInt(hex.slice(1,3),16)/255
  const g=parseInt(hex.slice(3,5),16)/255
  const b=parseInt(hex.slice(5,7),16)/255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){
    const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min)
    switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break}
  }
  return[Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}

function hslToHex(h:number,s:number,l:number):string{
  s/=100;l/=100
  const k=(n:number)=>(n+h/30)%12
  const a=s*Math.min(l,1-l)
  const f=(n:number)=>Math.round(255*(l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)))))
  return '#'+[f(0),f(8),f(4)].map(x=>x.toString(16).padStart(2,'0')).join('')
}

type SchemeType='analogous'|'complementary'|'triadic'|'tetradic'|'monochromatic'|'split'

function generatePalette(hex:string,scheme:SchemeType):string[]{
  const [h,s,l]=hexToHsl(hex)
  switch(scheme){
    case 'analogous': return[hslToHex((h-30+360)%360,s,l),hex,hslToHex((h+30)%360,s,l),hslToHex((h+60)%360,s,l)]
    case 'complementary': return[hex,hslToHex((h+180)%360,s,l)]
    case 'triadic': return[hex,hslToHex((h+120)%360,s,l),hslToHex((h+240)%360,s,l)]
    case 'tetradic': return[hex,hslToHex((h+90)%360,s,l),hslToHex((h+180)%360,s,l),hslToHex((h+270)%360,s,l)]
    case 'monochromatic': return[hslToHex(h,s,Math.max(15,l-30)),hslToHex(h,s,Math.max(15,l-15)),hex,hslToHex(h,s,Math.min(85,l+15)),hslToHex(h,s,Math.min(85,l+30))]
    case 'split': return[hex,hslToHex((h+150)%360,s,l),hslToHex((h+210)%360,s,l)]
    default: return[hex]
  }
}

const SCHEMES:SchemeType[]=['monochromatic','analogous','complementary','triadic','tetradic','split']

export default function ColorPaletteGeneratorPage() {
  const [baseColor,setBaseColor]=useState('#3B82F6')
  const [scheme,setScheme]=useState<SchemeType>('analogous')
  const [copied,setCopied]=useState<string|null>(null)

  const palette=generatePalette(baseColor,scheme)

  function copy(hex:string){navigator.clipboard.writeText(hex);setCopied(hex);setTimeout(()=>setCopied(null),1500)}
  function copyAll(){navigator.clipboard.writeText(palette.join(', '));setCopied('all');setTimeout(()=>setCopied(null),1500)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Palette Generator</h1>
        <p className="text-gray-500 mb-8">Generate harmonious color palettes from any base color</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Color</label>
              <div className="flex gap-2">
                <input type="color" value={baseColor} onChange={e=>setBaseColor(e.target.value)}
                  className="w-14 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                <input type="text" value={baseColor} onChange={e=>/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)&&setBaseColor(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
            <div className="flex flex-wrap gap-2">
              {SCHEMES.map(s=>(
                <button key={s} onClick={()=>setScheme(s)} className={'px-3 py-1.5 rounded-lg capitalize text-sm font-medium transition-colors '+(scheme===s?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex" style={{height:120}}>
            {palette.map(c=>(
              <div key={c} style={{background:c,flex:1}} />
            ))}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {palette.map(c=>(
                <button key={c} onClick={()=>copy(c)} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
                  <span style={{background:c}} className="w-6 h-6 rounded-md border border-gray-200 block flex-shrink-0" />
                  <span className="font-mono text-sm text-gray-700">{c.toUpperCase()}</span>
                  {copied===c&&<span className="text-xs text-green-500">\u2713</span>}
                </button>
              ))}
            </div>
            <button onClick={copyAll} className="mt-3 w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">{copied==='all'?'\u2713 Copied!':'Copy All Hex Codes'}</button>
          </div>
        </div>
      </div>
    </main>
  )
}