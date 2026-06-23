'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [text,setText]=useState('Gradient Text')
  const [c1,setC1]=useState('#6366f1')
  const [c2,setC2]=useState('#ec4899')
  const [c3,setC3]=useState('')
  const [angle,setAngle]=useState(135)
  const [size,setSize]=useState(48)
  const [weight,setWeight]=useState('700')
  const colors=c3?c1+', '+c2+', '+c3:c1+', '+c2
  const grad='linear-gradient('+angle+'deg, '+colors+')'
  const style={backgroundImage:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontSize:size+'px',fontWeight:weight,display:'inline-block',lineHeight:1.2}
  const css='.gradient-text {\n  background-image: '+grad+';\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  font-size: '+size+'px;\n  font-weight: '+weight+';\n}'
  const tool=TOOLS.find(t=>t.slug==='gradient-text-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
          <input value={text} onChange={e=>setText(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-600">Color 1<input type="color" value={c1} onChange={e=>setC1(e.target.value)} className="w-full h-9 rounded cursor-pointer"/></label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">Color 2<input type="color" value={c2} onChange={e=>setC2(e.target.value)} className="w-full h-9 rounded cursor-pointer"/></label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">Color 3 (opt)<input type="color" value={c3||'#ffffff'} onChange={e=>setC3(e.target.value)} className="w-full h-9 rounded cursor-pointer"/></label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-600">Angle
            <input type="number" min={0} max={360} value={angle} onChange={e=>setAngle(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">Font Size
            <input type="number" min={12} max={120} value={size} onChange={e=>setSize(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">Weight
            <select value={weight} onChange={e=>setWeight(e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm">
              {['400','500','600','700','800','900'].map(w=><option key={w}>{w}</option>)}
            </select></label>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 flex items-center justify-center min-h-[120px]">
          <span style={style}>{text||'Gradient Text'}</span>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">CSS</label>
          <textarea value={css} readOnly rows={7} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(css)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy CSS</button>
      </div>
    </ToolLayout>
  )
}