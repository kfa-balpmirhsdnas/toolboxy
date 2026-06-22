'use client'
import { useState } from 'react'

const PRESETS=[
  {name:'16:9',w:16,h:9},{name:'4:3',w:4,h:3},{name:'1:1',w:1,h:1},
  {name:'21:9',w:21,h:9},{name:'3:2',w:3,h:2},{name:'2:3',w:2,h:3},
  {name:'4:5',w:4,h:5},{name:'9:16',w:9,h:16},{name:'5:4',w:5,h:4},
]

function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}

export default function AspectRatioCalculatorPage() {
  const [width,setWidth]=useState('1920')
  const [height,setHeight]=useState('1080')
  const [lockOn,setLockOn]=useState<'width'|'height'|null>(null)
  const [targetW,setTargetW]=useState('1280')
  const [targetH,setTargetH]=useState('')

  const w=parseFloat(width)||0,h=parseFloat(height)||0
  const g=w>0&&h>0?gcd(Math.round(w),Math.round(h)):1
  const ratioW=w>0&&h>0?Math.round(w)/g:0
  const ratioH=w>0&&h>0?Math.round(h)/g:0
  const ratio=h>0?w/h:0
  const pct=h>0?(h/w*100).toFixed(4):'—'

  // Scale calculation
  const tw=parseFloat(targetW)||0,th=parseFloat(targetH)||0
  let scaledW='',scaledH=''
  if(tw>0&&ratio>0){scaledH=(tw/ratio).toFixed(0)}
  if(th>0&&ratio>0){scaledW=(th*ratio).toFixed(0)}

  function applyPreset(pw:number,ph:number){
    setWidth(String(pw*100));setHeight(String(ph*100))
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aspect Ratio Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate and convert image or video aspect ratios</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Common Presets</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p=>(
                <button key={p.name} onClick={()=>applyPreset(p.w,p.h)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-700 font-medium">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input type="number" value={width} onChange={e=>setWidth(e.target.value)} min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input type="number" value={height} onChange={e=>setHeight(e.target.value)} min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          {w>0&&h>0&&(
            <div className="grid grid-cols-3 gap-3">
              {[['Ratio',ratioW+':'+ratioH],['Decimal',ratio.toFixed(4)],['Height %',pct+'%']].map(([l,v])=>(
                <div key={l} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                  <div className="font-bold text-brand-700">{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          )}
          {w>0&&h>0&&(
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-center mb-3">
                <div style={{width:160,height:Math.round(160/ratio)||80,background:'#EFF6FF',border:'2px solid #3B82F6',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span className="text-xs text-blue-500 font-medium">{ratioW}:{ratioH}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Scale to New Size</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Width</label>
              <input type="number" value={targetW} onChange={e=>{setTargetW(e.target.value);setTargetH('')}} min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {targetW&&scaledH&&<p className="text-xs text-gray-400 mt-1">Height = <strong>{scaledH}px</strong></p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Height</label>
              <input type="number" value={targetH} onChange={e=>{setTargetH(e.target.value);setTargetW('')}} min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {targetH&&scaledW&&<p className="text-xs text-gray-400 mt-1">Width = <strong>{scaledW}px</strong></p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}