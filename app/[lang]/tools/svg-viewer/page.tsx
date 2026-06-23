'use client'
import {useState,useRef} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
const SAMPLE='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#3b82f6" opacity="0.8"/><rect x="30" y="30" width="40" height="40" fill="#f59e0b" opacity="0.6" rx="5"/><text x="50" y="55" font-family="sans-serif" font-size="12" text-anchor="middle" fill="white">SVG</text></svg>'
export default function Page(){
  const [code,setCode]=useState(SAMPLE)
  const [bg,setBg]=useState('#ffffff')
  const [scale,setScale]=useState(2)
  const valid=code.trim().startsWith('<svg')
  const dl=()=>{const a=document.createElement('a');a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(code);a.download='image.svg';a.click()}
  const tool=TOOLS.find(t=>t.slug==='svg-viewer')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-600">SVG Code</p>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs text-gray-600">BG<input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-6 h-6 rounded"/></label>
                <select value={scale} onChange={e=>setScale(+e.target.value)} className="rounded border border-gray-300 px-1 py-0.5 text-xs">
                  {[1,2,3,4].map(s=><option key={s} value={s}>{s}x</option>)}</select>
              </div>
            </div>
            <textarea value={code} onChange={e=>setCode(e.target.value)} rows={14} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Preview</p>
            <div className="rounded-xl border border-gray-200 flex items-center justify-center overflow-auto min-h-[250px]" style={{backgroundColor:bg}}>
              {valid?<div style={{transform:'scale('+scale+')',transformOrigin:'center center'}} dangerouslySetInnerHTML={{__html:code}}/>:
                <p className="text-red-500 text-sm">Invalid SVG</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={dl} disabled={!valid} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Download SVG</button>
          <button onClick={()=>navigator.clipboard?.writeText(code)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Copy Code</button>
          <button onClick={()=>setCode(SAMPLE)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Sample</button>
        </div>
      </div>
    </ToolLayout>
  )
}