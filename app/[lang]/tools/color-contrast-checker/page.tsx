'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('color-contrast-checker')!
function hexToRgb(h:string):[number,number,number]{
  const r=h.replace('#','')
  return [parseInt(r.slice(0,2),16),parseInt(r.slice(2,4),16),parseInt(r.slice(4,6),16)]
}
function linearize(c:number):number{const s=c/255;return s<=0.04045?s/12.92:Math.pow((s+0.055)/1.055,2.4)}
function luminance(h:string):number{const [r,g,b]=hexToRgb(h);return 0.2126*linearize(r)+0.7152*linearize(g)+0.0722*linearize(b)}
function contrast(a:string,b:string):number{const l1=luminance(a),l2=luminance(b);const [lMax,lMin]=l1>l2?[l1,l2]:[l2,l1];return (lMax+0.05)/(lMin+0.05)}
export default function ColorContrastCheckerPage() {
  const [fg,setFg]=useState('#1a1a1a')
  const [bg,setBg]=useState('#ffffff')
  const ratio=contrast(fg,bg)
  const ratioStr=ratio.toFixed(2)+':1'
  const aaLarge=ratio>=3
  const aaSmall=ratio>=4.5
  const aaaLarge=ratio>=4.5
  const aaaSmall=ratio>=7
  const PAIRS=[
    {fg:'#000000',bg:'#ffffff'},{fg:'#ffffff',bg:'#000000'},{fg:'#1a1a1a',bg:'#f8f9fa'},
    {fg:'#2563eb',bg:'#ffffff'},{fg:'#ffffff',bg:'#2563eb'},{fg:'#16a34a',bg:'#ffffff'},
    {fg:'#dc2626',bg:'#ffffff'},{fg:'#ffffff',bg:'#7c3aed'},{fg:'#f59e0b',bg:'#1f2937'},
  ]
  const BADGE=(pass:boolean)=>pass?'bg-green-100 text-green-700':'bg-red-100 text-red-700'
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Foreground (text)</label>
            <div className="flex gap-2">
              <input type="color" value={fg} onChange={e=>setFg(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={fg} onChange={e=>setFg(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 font-mono text-sm uppercase"/>
            </div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
            <div className="flex gap-2">
              <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 font-mono text-sm uppercase"/>
            </div></div>
        </div>
        <div className="rounded-xl p-6 text-center" style={{background:bg,border:'1px solid #e5e7eb'}}>
          <p className="text-3xl font-bold mb-1" style={{color:fg}}>Sample Text</p>
          <p className="text-sm" style={{color:fg}}>The quick brown fox jumps over the lazy dog</p>
          <p className="text-xl font-bold mt-3" style={{color:fg}}>Contrast ratio: {ratioStr}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {label:'AA Large text (3:1)',pass:aaLarge},
            {label:'AA Normal text (4.5:1)',pass:aaSmall},
            {label:'AAA Large text (4.5:1)',pass:aaaLarge},
            {label:'AAA Normal text (7:1)',pass:aaaSmall},
          ].map(r=>(
            <div key={r.label} className={'flex items-center gap-2 rounded-lg p-3 '+BADGE(r.pass)}>
              <span className="text-xl">{r.pass?'✅':'❌'}</span>
              <span className="text-xs font-medium">{r.label}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Common pairs</p>
          <div className="flex flex-wrap gap-2">
            {PAIRS.map(p=>(
              <button key={p.fg+p.bg} onClick={()=>{setFg(p.fg);setBg(p.bg)}}
                className="px-3 py-1.5 rounded border border-gray-200 text-xs font-medium hover:scale-105 transition"
                style={{background:p.bg,color:p.fg}}>{contrast(p.fg,p.bg).toFixed(1)}:1</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}