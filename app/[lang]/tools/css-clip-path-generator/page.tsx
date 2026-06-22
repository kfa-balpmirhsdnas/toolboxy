'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-clip-path-generator')!
const PRESETS=[
  {name:'Triangle',path:'polygon(50% 0%, 0% 100%, 100% 100%)'},
  {name:'Diamond',path:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'},
  {name:'Pentagon',path:'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'},
  {name:'Hexagon',path:'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'},
  {name:'Arrow Right',path:'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)'},
  {name:'Star',path:'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'},
  {name:'Parallelogram',path:'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'},
  {name:'Cross',path:'polygon(33% 0%, 66% 0%, 66% 33%, 100% 33%, 100% 66%, 66% 66%, 66% 100%, 33% 100%, 33% 66%, 0% 66%, 0% 33%, 33% 33%)'},
  {name:'Circle',path:'circle(50% at 50% 50%)'},
  {name:'Ellipse',path:'ellipse(50% 30% at 50% 50%)'},
  {name:'Inset',path:'inset(10% 15% 10% 15% round 10px)'},
]
export default function CssClipPathGeneratorPage() {
  const [clipPath,setClipPath]=useState('polygon(50% 0%, 0% 100%, 100% 100%)')
  const [bg,setBg]=useState('#6366f1')
  const [copied,setCopied]=useState(false)
  const css='clip-path: '+clipPath+';'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.name} onClick={()=>setClipPath(p.path)}
              className={'px-3 py-1.5 rounded-full border text-xs font-medium transition '+(clipPath===p.path?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50')}>{p.name}</button>
          ))}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Custom clip-path value</label>
          <input value={clipPath} onChange={e=>setClipPath(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" spellCheck={false}/>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">Background</span>
          <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5"/>
        </div>
        <div className="flex justify-center py-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-48 h-48" style={{background:bg,clipPath}}/>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <code className="text-green-400 font-mono text-sm break-all">{css}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
        <div className="text-xs text-gray-400 space-y-0.5">
          <p><strong className="text-gray-600">polygon()</strong> — custom polygon with x y point pairs</p>
          <p><strong className="text-gray-600">circle(r at x y)</strong> — circular clip</p>
          <p><strong className="text-gray-600">ellipse(rx ry at x y)</strong> — elliptical clip</p>
          <p><strong className="text-gray-600">inset(top right bottom left round radius)</strong> — rectangular with optional rounding</p>
        </div>
      </div>
    </ToolLayout>
  )
}