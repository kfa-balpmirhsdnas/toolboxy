'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-flexbox-generator')!
export default function CssFlexboxGeneratorPage() {
  const [dir,setDir]=useState('row')
  const [wrap,setWrap]=useState('nowrap')
  const [justify,setJustify]=useState('flex-start')
  const [align,setAlign]=useState('stretch')
  const [gap,setGap]=useState(8)
  const [items,setItems]=useState(4)
  const [copied,setCopied]=useState(false)
  const css=`.container {\n  display: flex;\n  flex-direction: ${dir};\n  flex-wrap: ${wrap};\n  justify-content: ${justify};\n  align-items: ${align};\n  gap: ${gap}px;\n}`
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const Sel=({label,val,set,opts}:{label:string;val:string;set:(v:string)=>void;opts:string[]})=>(
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={val} onChange={e=>set(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Sel label="flex-direction" val={dir} set={setDir} opts={['row','row-reverse','column','column-reverse']}/>
          <Sel label="flex-wrap" val={wrap} set={setWrap} opts={['nowrap','wrap','wrap-reverse']}/>
          <Sel label="justify-content" val={justify} set={setJustify} opts={['flex-start','flex-end','center','space-between','space-around','space-evenly']}/>
          <Sel label="align-items" val={align} set={setAlign} opts={['stretch','flex-start','flex-end','center','baseline']}/>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">gap: {gap}px</label>
            <input type="range" min="0" max="40" value={gap} onChange={e=>setGap(Number(e.target.value))} className="w-full"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Items: {items}</label>
            <input type="range" min="1" max="10" value={items} onChange={e=>setItems(Number(e.target.value))} className="w-full"/>
          </div>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 min-h-32 bg-gray-50"
          style={{display:'flex',flexDirection:dir as 'row'|'column',flexWrap:wrap as 'nowrap'|'wrap',justifyContent:justify,alignItems:align,gap:gap+'px'}}>
          {Array.from({length:items},(_,i)=>(
            <div key={i} className="bg-blue-500 text-white text-sm font-bold rounded-lg flex items-center justify-center"
              style={{minWidth:'50px',minHeight:'40px',padding:'8px 12px'}}>{i+1}</div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <pre className="text-green-400 text-sm font-mono flex-1 overflow-x-auto">{css}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}