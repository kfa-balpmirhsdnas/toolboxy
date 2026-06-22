'use client'
import { useState } from 'react'

function hexToRgb(hex:string):{r:number;g:number;b:number}|null{
  const m=hex.replace('#','').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if(!m) return null
  return {r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}
}
function rgbToHex(r:number,g:number,b:number){return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
function rgbToHsl(r:number,g:number,b:number):[number,number,number]{
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;}}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}

export default function ColorMixerPage() {
  const [c1, setC1] = useState('#FF0000')
  const [c2, setC2] = useState('#0000FF')
  const [ratio, setRatio] = useState(50)

  const r1=hexToRgb(c1), r2=hexToRgb(c2)
  const mixed = r1&&r2 ? {
    r: r1.r*(1-ratio/100) + r2.r*(ratio/100),
    g: r1.g*(1-ratio/100) + r2.g*(ratio/100),
    b: r1.b*(1-ratio/100) + r2.b*(ratio/100),
  } : null
  const mixedHex = mixed ? rgbToHex(mixed.r,mixed.g,mixed.b) : ''
  const mixedHsl = mixed ? rgbToHsl(mixed.r,mixed.g,mixed.b) : null

  // Generate gradient steps
  const steps = Array.from({length:9},(_,i)=>({
    pct:(i+1)*10,
    hex: r1&&r2 ? rgbToHex(r1.r*(1-(i+1)/10)+r2.r*(i+1)/10,r1.g*(1-(i+1)/10)+r2.g*(i+1)/10,r1.b*(1-(i+1)/10)+r2.b*(i+1)/10) : '#000',
  }))

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Mixer</h1>
        <p className="text-gray-500 mb-8">Mix two colors together and get the result in HEX, RGB and HSL</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color 1</label>
              <div className="flex gap-2">
                <input type="color" value={c1} onChange={e=>setC1(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={c1} onChange={e=>setC1(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color 2</label>
              <div className="flex gap-2">
                <input type="color" value={c2} onChange={e=>setC2(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={c2} onChange={e=>setC2(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Mix Ratio</label>
              <span className="text-sm text-gray-500">{100-ratio}% Color 1 / {ratio}% Color 2</span>
            </div>
            <input type="range" min={0} max={100} value={ratio} onChange={e=>setRatio(parseInt(e.target.value))} className="w-full" />
          </div>
          {mixedHex && (
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
              <div className="w-20 h-20 rounded-xl border border-gray-200 shadow-sm shrink-0" style={{backgroundColor:mixedHex}} />
              <div className="space-y-1">
                <div className="font-mono font-bold text-lg text-gray-800">{mixedHex.toUpperCase()}</div>
                {mixed&&<div className="text-sm text-gray-600">RGB({Math.round(mixed.r)}, {Math.round(mixed.g)}, {Math.round(mixed.b)})</div>}
                {mixedHsl&&<div className="text-sm text-gray-600">HSL({mixedHsl[0]}\u00B0, {mixedHsl[1]}%, {mixedHsl[2]}%)</div>}
              </div>
            </div>
          )}
        </div>
        {r1&&r2&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Gradient Steps</h2>
            <div className="flex rounded-xl overflow-hidden h-16">
              <div className="flex-1" style={{backgroundColor:c1}} />
              {steps.map(s=><div key={s.pct} className="flex-1" style={{backgroundColor:s.hex}} />)}
              <div className="flex-1" style={{backgroundColor:c2}} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}