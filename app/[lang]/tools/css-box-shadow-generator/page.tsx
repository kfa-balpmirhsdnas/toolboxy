'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-box-shadow-generator')!
export default function CssBoxShadowGeneratorPage() {
  const [hOffset,setHOffset]=useState(4)
  const [vOffset,setVOffset]=useState(4)
  const [blur,setBlur]=useState(10)
  const [spread,setSpread]=useState(0)
  const [color,setColor]=useState('#00000040')
  const [inset,setInset]=useState(false)
  const [layers,setLayers]=useState<{h:number;v:number;b:number;s:number;c:string;i:boolean}[]>([])
  const currentShadow=`${inset?'inset ':''}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${color}`
  const allShadows=[currentShadow,...layers.map(l=>`${l.i?'inset ':''}${l.h}px ${l.v}px ${l.b}px ${l.s}px ${l.c}`)].join(', ')
  const cssValue=`box-shadow: ${allShadows};`
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(cssValue);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const addLayer=()=>setLayers([...layers,{h:hOffset,v:vOffset,b:blur,s:spread,c:color,i:inset}])
  const sliders=[
    {label:'Horizontal offset',val:hOffset,set:setHOffset,min:-50,max:50},
    {label:'Vertical offset',val:vOffset,set:setVOffset,min:-50,max:50},
    {label:'Blur radius',val:blur,set:setBlur,min:0,max:100},
    {label:'Spread radius',val:spread,set:setSpread,min:-50,max:50},
  ]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {sliders.map(s=>(
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <label className="font-medium text-gray-700">{s.label}</label>
                  <span className="font-mono text-blue-700">{s.val}px</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={s.val} onChange={e=>s.set(Number(e.target.value))} className="w-full"/>
              </div>
            ))}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="color" value={color.slice(0,7)} onChange={e=>setColor(e.target.value+(color.length>7?color.slice(7):'80'))} className="w-12 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
                <input type="range" min="0" max="100" value={Math.round(parseInt(color.slice(7,9)||'80',16)/255*100)}
                  onChange={e=>{const h=Math.round(Number(e.target.value)/100*255).toString(16).padStart(2,'0');setColor(color.slice(0,7)+h)}}
                  className="w-24"/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input type="checkbox" checked={inset} onChange={e=>setInset(e.target.checked)} className="rounded"/>
                <span className="text-sm text-gray-700">Inset</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-40 h-40 bg-white rounded-2xl border border-gray-100 transition-all" style={{boxShadow:allShadows}}/>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
          <code className="text-green-400 text-sm font-mono break-all">{cssValue}</code>
          <button onClick={copy} className="ml-3 flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
            {copied?'Copied!':'Copy'}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={addLayer} className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50">+ Add layer</button>
          {layers.length>0&&<button onClick={()=>setLayers([])} className="text-sm text-red-500 hover:underline">Clear layers ({layers.length})</button>}
        </div>
      </div>
    </ToolLayout>
  )
}