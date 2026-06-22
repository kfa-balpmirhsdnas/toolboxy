'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-flexbox-generator')!
const BOXES=5
export default function CssFlexboxGeneratorPage() {
  const [direction,setDirection]=useState('row')
  const [wrap,setWrap]=useState('nowrap')
  const [justify,setJustify]=useState('flex-start')
  const [align,setAlign]=useState('stretch')
  const [alignContent,setAlignContent]=useState('normal')
  const [gap,setGap]=useState(8)
  const [copied,setCopied]=useState(false)
  const css='display: flex;
flex-direction: '+direction+';
flex-wrap: '+wrap+';
justify-content: '+justify+';
align-items: '+align+';
align-content: '+alignContent+';
gap: '+gap+'px;'
  const copy=()=>{navigator.clipboard.writeText('.container {
  '+css.split('
').join('
  ')+'
}');setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const Sel=({label,val,set,opts}:{label:string;val:string;set:(v:string)=>void;opts:string[]})=>(
    <div><label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select value={val} onChange={e=>set(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">{opts.map(o=><option key={o}>{o}</option>)}</select></div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Sel label="flex-direction" val={direction} set={setDirection} opts={['row','row-reverse','column','column-reverse']}/>
          <Sel label="flex-wrap" val={wrap} set={setWrap} opts={['nowrap','wrap','wrap-reverse']}/>
          <Sel label="justify-content" val={justify} set={setJustify} opts={['flex-start','flex-end','center','space-between','space-around','space-evenly']}/>
          <Sel label="align-items" val={align} set={setAlign} opts={['stretch','flex-start','flex-end','center','baseline']}/>
          <Sel label="align-content" val={alignContent} set={setAlignContent} opts={['normal','flex-start','flex-end','center','space-between','space-around','stretch']}/>
          <div><label className="block text-xs text-gray-500 mb-1">gap: {gap}px</label>
            <input type="range" min="0" max="40" value={gap} onChange={e=>setGap(Number(e.target.value))} className="w-full"/></div>
        </div>
        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-3 min-h-36 overflow-hidden"
          style={{display:'flex',flexDirection:direction as any,flexWrap:wrap as any,justifyContent:justify,alignItems:align,alignContent:alignContent,gap:gap+'px'}}>
          {Array.from({length:BOXES},(_,i)=>(
            <div key={i} className="flex items-center justify-center rounded-lg text-white font-bold text-sm flex-shrink-0"
              style={{background:['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6'][i],width:48+i*8,height:48+i*8}}>{i+1}</div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex justify-between gap-3">
          <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{'.container {
  '+css.split('
').join('
  ')+'
}'}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs h-fit hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}