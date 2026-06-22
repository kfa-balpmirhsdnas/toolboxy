'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('css-flexbox-playground')!

type FlexDir = 'row'|'row-reverse'|'column'|'column-reverse'
type FlexWrap = 'nowrap'|'wrap'|'wrap-reverse'
type JustifyContent = 'flex-start'|'flex-end'|'center'|'space-between'|'space-around'|'space-evenly'
type AlignItems = 'stretch'|'flex-start'|'flex-end'|'center'|'baseline'
type AlignContent = 'normal'|'flex-start'|'flex-end'|'center'|'space-between'|'space-around'

const COLORS = ['#6366f1','#ec4899','#f97316','#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6']

export default function CssFlexboxPlaygroundPage({ params }: { params: { lang: string } }) {
  const [flexDirection, setFlexDirection] = useState<FlexDir>('row')
  const [flexWrap, setFlexWrap] = useState<FlexWrap>('wrap')
  const [justifyContent, setJustifyContent] = useState<JustifyContent>('flex-start')
  const [alignItems, setAlignItems] = useState<AlignItems>('stretch')
  const [alignContent, setAlignContent] = useState<AlignContent>('flex-start')
  const [gap, setGap] = useState(8)
  const [itemCount, setItemCount] = useState(6)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('css-flexbox-playground'); tracked.current = true } }

  const css = `.container {
  display: flex;
  flex-direction: ${flexDirection};
  flex-wrap: ${flexWrap};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  align-content: ${alignContent};
  gap: ${gap}px;
}`

  async function copy() {
    await navigator.clipboard.writeText(css)
    trackToolCopy('css-flexbox-playground')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function Select({ label, value, options, onChange }: { label:string; value:string; options:string[]; onChange:(v:string)=>void }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <select value={value} onChange={e=>{onChange(e.target.value);track()}}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Select label="flex-direction" value={flexDirection} options={['row','row-reverse','column','column-reverse']} onChange={v=>setFlexDirection(v as FlexDir)} />
          <Select label="flex-wrap" value={flexWrap} options={['nowrap','wrap','wrap-reverse']} onChange={v=>setFlexWrap(v as FlexWrap)} />
          <Select label="justify-content" value={justifyContent} options={['flex-start','flex-end','center','space-between','space-around','space-evenly']} onChange={v=>setJustifyContent(v as JustifyContent)} />
          <Select label="align-items" value={alignItems} options={['stretch','flex-start','flex-end','center','baseline']} onChange={v=>setAlignItems(v as AlignItems)} />
          <Select label="align-content" value={alignContent} options={['normal','flex-start','flex-end','center','space-between','space-around']} onChange={v=>setAlignContent(v as AlignContent)} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">gap: {gap}px</label>
            <input type="range" min={0} max={32} value={gap} onChange={e=>{setGap(parseInt(e.target.value));track()}} className="w-full accent-brand-600" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600">Items: {itemCount}</label>
          <input type="range" min={1} max={12} value={itemCount} onChange={e=>{setItemCount(parseInt(e.target.value));track()}} className="flex-1 accent-brand-600" />
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-3 min-h-40"
          style={{ display:'flex', flexDirection, flexWrap, justifyContent, alignItems, alignContent, gap:gap+'px' }}>
          {Array(itemCount).fill(0).map((_,i)=>(
            <div key={i} className="flex items-center justify-center text-white text-xs font-bold rounded-lg min-w-12 min-h-12"
              style={{background:COLORS[i%COLORS.length], width:48+(i%3)*16, height:alignItems==='stretch'?undefined:48+(i%2)*16}}>
              {i+1}
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
