'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-unit-converter')!
export default function CssUnitConverterPage() {
  const [rootFontSize,setRootFontSize]=useState(16)
  const [viewportW,setViewportW]=useState(1440)
  const [viewportH,setViewportH]=useState(900)
  const [px,setPx]=useState(16)
  const rem=px/rootFontSize
  const em=px/rootFontSize
  const vw=px/viewportW*100
  const vh=px/viewportH*100
  const pt=px*0.75
  const cm=px/37.7952756
  const mm=px/3.77952756
  const inch=px/96
  const results=[
    {unit:'px',val:px.toFixed(4),desc:'Pixels'},
    {unit:'rem',val:rem.toFixed(4),desc:`Relative to root (${rootFontSize}px)`},
    {unit:'em',val:em.toFixed(4),desc:'Relative to parent (assuming same as root)'},
    {unit:'vw',val:vw.toFixed(4),desc:`Viewport width (${viewportW}px)`},
    {unit:'vh',val:vh.toFixed(4),desc:`Viewport height (${viewportH}px)`},
    {unit:'pt',val:pt.toFixed(4),desc:'Points (1pt = 1.333px)'},
    {unit:'cm',val:cm.toFixed(4),desc:'Centimeters'},
    {unit:'mm',val:mm.toFixed(4),desc:'Millimeters'},
    {unit:'in',val:inch.toFixed(4),desc:'Inches (1in = 96px)'},
  ]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Root font size (px)</label>
            <input type="number" value={rootFontSize} onChange={e=>setRootFontSize(Number(e.target.value)||16)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Viewport width (px)</label>
            <input type="number" value={viewportW} onChange={e=>setViewportW(Number(e.target.value)||1440)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Viewport height (px)</label>
            <input type="number" value={viewportH} onChange={e=>setViewportH(Number(e.target.value)||900)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"/></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value in pixels</label>
          <div className="flex gap-2">
            <input type="number" value={px} onChange={e=>setPx(Number(e.target.value)||0)} className="flex-1 rounded border border-gray-300 px-3 py-2.5 text-lg font-mono"/>
            <span className="flex items-center text-gray-500 font-semibold">px</span>
          </div>
          <input type="range" min="0" max="200" value={Math.min(px,200)} onChange={e=>setPx(Number(e.target.value))} className="w-full mt-2"/>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {results.map(r=>(
            <div key={r.unit} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer" onClick={()=>navigator.clipboard.writeText(r.val+r.unit)}>
              <div>
                <span className="font-bold text-blue-700 w-8 inline-block">{r.unit}</span>
                <span className="text-xs text-gray-400 ml-2">{r.desc}</span>
              </div>
              <span className="font-mono text-sm font-semibold text-gray-800">{parseFloat(r.val)}{r.unit}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">Click any row to copy</p>
      </div>
    </ToolLayout>
  )
}