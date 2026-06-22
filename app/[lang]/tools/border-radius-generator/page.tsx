'use client'
import { useState } from 'react'

export default function BorderRadiusGeneratorPage() {
  const [linked,setLinked]=useState(true)
  const [tl,setTl]=useState(16)
  const [tr,setTr]=useState(16)
  const [br,setBr]=useState(16)
  const [bl,setBl]=useState(16)
  const [unit,setUnit]=useState<'px'|'%'>('px')
  const [bgColor,setBgColor]=useState('#3B82F6')
  const [copied,setCopied]=useState(false)

  function setAll(v:number){setTl(v);setTr(v);setBr(v);setBl(v)}
  function handleChange(setter:(v:number)=>void,v:number){
    if(linked) setAll(v)
    else setter(v)
  }

  const vals=[tl,tr,br,bl]
  const allSame=vals.every(v=>v===vals[0])
  const css=allSame?`border-radius: ${tl}${unit};`:`border-radius: ${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit};`

  function copy(){navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}

  const PRESETS=[
    {name:'None',v:[0,0,0,0]},{name:'Sm',v:[4,4,4,4]},{name:'Md',v:[8,8,8,8]},
    {name:'Lg',v:[16,16,16,16]},{name:'XL',v:[24,24,24,24]},{name:'Full',v:[9999,9999,9999,9999]},
    {name:'Pill',v:[50,50,50,50]},{name:'Leaf',v:[0,50,0,50]},{name:'Wave',v:[60,10,60,10]},
  ]

  const corners=[['Top Left',tl,setTl],['Top Right',tr,setTr],['Bottom Right',br,setBr],['Bottom Left',bl,setBl]] as const

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Border Radius Generator</h1>
        <p className="text-gray-500 mb-8">Create custom border radius shapes with live preview</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>{setTl(p.v[0]);setTr(p.v[1]);setBr(p.v[2]);setBl(p.v[3])}}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg font-medium">{p.name}</button>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={linked} onChange={e=>setLinked(e.target.checked)} className="rounded" />
              Link corners
            </label>
            {['px','%'].map(u=>(
              <button key={u} onClick={()=>setUnit(u as 'px'|'%')} className={'px-3 py-1 text-sm rounded-lg font-mono '+(unit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
            ))}
            <label className="flex items-center gap-2 text-sm ml-auto">
              <span className="text-gray-600">Color</span>
              <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-8 h-6 rounded border border-gray-300" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {corners.map(([label,val,setter])=>(
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span className="font-mono">{val}{unit}</span></div>
                <input type="range" min={0} max={unit==='%'?50:100} value={val} onChange={e=>handleChange(setter,parseInt(e.target.value))} className="w-full accent-brand-500" />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="w-40 h-40" style={{background:bgColor,borderRadius:`${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`}} />
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
            <code className="font-mono text-sm text-gray-700">{css}</code>
            <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded ml-2">{copied?'\u2713':'Copy'}</button>
          </div>
        </div>
      </div>
    </main>
  )
}