'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const COLORS=['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6']


const tool = getToolBySlug('css-flexbox-generator')!

export default function FlexboxGeneratorPage() {
  const [direction,setDirection]=useState('row')
  const [wrap,setWrap]=useState('nowrap')
  const [justify,setJustify]=useState('flex-start')
  const [align,setAlign]=useState('stretch')
  const [alignContent,setAlignContent]=useState('normal')
  const [gap,setGap]=useState(8)
  const [items,setItems]=useState(5)
  const [copied,setCopied]=useState(false)

  const css=`.container {\n  display: flex;\n  flex-direction: ${direction};\n  flex-wrap: ${wrap};\n  justify-content: ${justify};\n  align-items: ${align};${alignContent!=='normal'?`\n  align-content: ${alignContent};`:''}\n  gap: ${gap}px;\n}`

  function copy(){navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}

  const Select=({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]})=>(
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flexbox Generator</h1>
        <p className="text-gray-500 mb-6">Build CSS flexbox layouts visually with a live preview</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select label="flex-direction" value={direction} onChange={setDirection} options={['row','row-reverse','column','column-reverse']} />
              <Select label="flex-wrap" value={wrap} onChange={setWrap} options={['nowrap','wrap','wrap-reverse']} />
              <Select label="justify-content" value={justify} onChange={setJustify} options={['flex-start','flex-end','center','space-between','space-around','space-evenly']} />
              <Select label="align-items" value={align} onChange={setAlign} options={['flex-start','flex-end','center','stretch','baseline']} />
              <Select label="align-content" value={alignContent} onChange={setAlignContent} options={['normal','flex-start','flex-end','center','space-between','space-around','stretch']} />
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>gap</span><span>{gap}px</span></div>
                <input type="range" min={0} max={40} value={gap} onChange={e=>setGap(parseInt(e.target.value))} className="w-full accent-brand-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Items</span><span>{items}</span></div>
              <input type="range" min={1} max={12} value={items} onChange={e=>setItems(parseInt(e.target.value))} className="w-full accent-brand-500" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div
                style={{display:'flex',flexDirection:direction as any,flexWrap:wrap as any,justifyContent:justify,alignItems:align,alignContent:alignContent,gap:gap,minHeight:160,background:'#F3F4F6',borderRadius:12,padding:12}}
              >
                {Array.from({length:items},(_,i)=>(
                  <div key={i} style={{background:COLORS[i%COLORS.length],borderRadius:6,padding:'8px 12px',color:'white',fontSize:12,fontWeight:'bold',minWidth:32,textAlign:'center'}}>{i+1}</div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">CSS</span>
                <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
              </div>
              <pre className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{css}</pre>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}