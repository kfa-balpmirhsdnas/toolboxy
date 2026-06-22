'use client'
import { useState } from 'react'

type Shadow={x:number;y:number;blur:number;spread:number;color:string;opacity:number;inset:boolean}

function shadowToCss(s:Shadow):string{
  const hex=s.color
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  const rgba=`rgba(${r},${g},${b},${s.opacity})`
  return `${s.inset?'inset ':''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${rgba}`
}

const DEFAULT:Shadow={x:0,y:4,blur:16,spread:0,color:'#000000',opacity:0.25,inset:false}

export default function BoxShadowGeneratorPage() {
  const [shadows,setShadows]=useState<Shadow[]>([{...DEFAULT}])
  const [bgColor,setBgColor]=useState('#ffffff')
  const [boxColor,setBoxColor]=useState('#3B82F6')
  const [copied,setCopied]=useState(false)

  const css='box-shadow: '+shadows.map(shadowToCss).join(',\n             ')+';'

  function update(i:number,f:keyof Shadow,v:unknown){
    setShadows(s=>s.map((x,j)=>j===i?{...x,[f]:v}:x))
  }
  function addShadow(){setShadows(s=>[...s,{...DEFAULT}])}
  function removeShadow(i:number){setShadows(s=>s.filter((_,j)=>j!==i))}
  function copy(){navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}

  const Slider=({label,value,min,max,step=1,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(v:number)=>void})=>(
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 w-14">{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} className="flex-1 accent-brand-500" />
      <span className="text-xs font-mono text-gray-700 w-10 text-right">{value}</span>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Box Shadow Generator</h1>
        <p className="text-gray-500 mb-6">Build multi-layer box shadows visually with live preview</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {shadows.map((s,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Layer {i+1}</span>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={s.inset} onChange={e=>update(i,'inset',e.target.checked)} />Inset</label>
                    {shadows.length>1&&<button onClick={()=>removeShadow(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
                  </div>
                </div>
                <Slider label="X" value={s.x} min={-50} max={50} onChange={v=>update(i,'x',v)} />
                <Slider label="Y" value={s.y} min={-50} max={50} onChange={v=>update(i,'y',v)} />
                <Slider label="Blur" value={s.blur} min={0} max={100} onChange={v=>update(i,'blur',v)} />
                <Slider label="Spread" value={s.spread} min={-50} max={50} onChange={v=>update(i,'spread',v)} />
                <Slider label="Opacity" value={s.opacity} min={0} max={1} step={0.01} onChange={v=>update(i,'opacity',v)} />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-14">Color</label>
                  <input type="color" value={s.color} onChange={e=>update(i,'color',e.target.value)} className="w-8 h-6 rounded border border-gray-300" />
                  <span className="text-xs font-mono text-gray-500">{s.color.toUpperCase()}</span>
                </div>
              </div>
            ))}
            <button onClick={addShadow} className="w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl">+ Add Layer</button>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Background</span>
                  <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-8 h-6 rounded border border-gray-300" />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Box</span>
                  <input type="color" value={boxColor} onChange={e=>setBoxColor(e.target.value)} className="w-8 h-6 rounded border border-gray-300" />
                </label>
              </div>
              <div className="rounded-xl flex items-center justify-center h-48" style={{background:bgColor}}>
                <div className="w-28 h-28 rounded-xl" style={{background:boxColor,boxShadow:shadows.map(shadowToCss).join(', ')}} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">CSS Output</span>
                <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
              </div>
              <pre className="font-mono text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap break-all">{css}</pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}