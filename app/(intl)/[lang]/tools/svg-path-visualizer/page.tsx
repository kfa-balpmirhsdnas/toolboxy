'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('svg-path-visualizer')!
const EXAMPLES=[
  {name:'spv_triangle',d:'M 50 10 L 90 90 L 10 90 Z'},
  {name:'spv_heart',d:'M 50 30 C 50 28, 48 20, 35 20 C 20 20, 20 38, 20 38 C 20 55, 35 65, 50 80 C 65 65, 80 55, 80 38 C 80 38, 80 20, 65 20 C 52 20, 50 28, 50 30 Z'},
  {name:'spv_star',d:'M 50 5 L 61 35 L 95 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 5 35 L 39 35 Z'},
  {name:'spv_arrow',d:'M 10 50 L 60 50 L 60 30 L 90 50 L 60 70 L 60 50'},
  {name:'spv_spiral',d:'M 50 50 m -30 0 a 30 30 0 1 1 60 0 a 20 20 0 1 0 -40 0 a 10 10 0 1 1 20 0'},
]
export default function SvgPathVisualizerPage() {
  const t = useTranslations('toolui')
  const [d,setD]=useState(EXAMPLES[0].d)
  const [fill,setFill]=useState('#3b82f6')
  const [stroke,setStroke]=useState('#1d4ed8')
  const [strokeW,setStrokeW]=useState(2)
  const [showFill,setShowFill]=useState(true)
  const [showPoints,setShowPoints]=useState(true)
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText('<path d="'+d+'" />');setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const BT='pathLength'
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(e=>(
            <button key={e.name} onClick={()=>setD(e.d)}
              className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{t(e.name)}</button>
          ))}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('spv_dattr')}</label>
          <textarea value={d} onChange={e=>setD(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-600">{t('spv_fill')}</label>
            <input type="color" value={fill} onChange={e=>setFill(e.target.value)} className="w-8 h-7 rounded border border-gray-300 cursor-pointer p-0.5"/>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-600">{t('spv_stroke')}</label>
            <input type="color" value={stroke} onChange={e=>setStroke(e.target.value)} className="w-8 h-7 rounded border border-gray-300 cursor-pointer p-0.5"/>
            <input type="range" min="0" max="10" value={strokeW} onChange={e=>setStrokeW(Number(e.target.value))} className="w-20"/>
            <span className="text-xs font-mono text-gray-600">{strokeW}px</span>
          </div>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={showFill} onChange={e=>setShowFill(e.target.checked)} className="rounded"/>{t('spv_fill')}
          </label>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex justify-center">
          <svg viewBox="0 0 100 100" width="300" height="300" xmlns="http://www.w3.org/2000/svg">
            <path d={d} fill={showFill?fill:'none'} stroke={stroke} strokeWidth={strokeW/10}/>
          </svg>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <code className="text-green-400 font-mono text-xs break-all">{'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" strokeWidth="'+strokeW+'" />'}</code>
          <button onClick={copy} className="flex-shrink-0 text-blue-400 hover:text-blue-300 text-xs">{copied?t('ui_copied'):t('ui_copy')}</button>
        </div>
      </div>
    </ToolLayout>
  )
}