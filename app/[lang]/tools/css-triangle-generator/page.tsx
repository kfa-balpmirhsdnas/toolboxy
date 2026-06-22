'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-triangle-generator')!
type Dir='top'|'bottom'|'left'|'right'|'top-left'|'top-right'|'bottom-left'|'bottom-right'
const DIRS:Dir[]=['top','bottom','left','right','top-left','top-right','bottom-left','bottom-right']
function getTriangleCss(dir:Dir,w:number,h:number,color:string):{element:string;css:string}{
  const t='transparent'
  const wHalf=Math.round(w/2),hHalf=Math.round(h/2)
  const maps:Record<Dir,{border:string}>=
  {top:{border:wHalf+'px solid '+t+'; border-top:0; border-bottom:'+h+'px solid '+color+'; border-left:'+wHalf+'px solid '+t},
   bottom:{border:wHalf+'px solid '+t+'; border-bottom:0; border-top:'+h+'px solid '+color+'; border-left:'+wHalf+'px solid '+t},
   left:{border:hHalf+'px solid '+t+'; border-left:0; border-right:'+w+'px solid '+color+'; border-top:'+hHalf+'px solid '+t},
   right:{border:hHalf+'px solid '+t+'; border-right:0; border-left:'+w+'px solid '+color+'; border-top:'+hHalf+'px solid '+t},
   'top-left':{border:w+'px solid '+t+'; border-top:'+h+'px solid '+color+'; border-right:0; border-left:0; border-bottom:0'},
   'top-right':{border:w+'px solid '+t+'; border-top:'+h+'px solid '+color+'; border-left:0; border-right:0; border-bottom:0'},
   'bottom-left':{border:w+'px solid '+t+'; border-bottom:'+h+'px solid '+color+'; border-right:0; border-left:0; border-top:0'},
   'bottom-right':{border:w+'px solid '+t+'; border-bottom:'+h+'px solid '+color+'; border-left:0; border-right:0; border-top:0'}}
  const b=maps[dir].border
  const css='.triangle {
  width: 0;
  height: 0;
  border: '+b+';
}'
  const style='width:0;height:0;border:'+b
  return{element:style,css}
}
export default function CssTriangleGeneratorPage() {
  const [dir,setDir]=useState<Dir>('top')
  const [w,setW]=useState(100)
  const [h,setH]=useState(80)
  const [color,setColor]=useState('#6366f1')
  const [copied,setCopied]=useState(false)
  const {element,css}=getTriangleCss(dir,w,h,color)
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const DIR_ICONS:Record<Dir,string>={top:'up',bottom:'down',left:'left',right:'right','top-left':'top-left','top-right':'top-right','bottom-left':'bottom-left','bottom-right':'bottom-right'}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Direction</p>
          <div className="grid grid-cols-4 gap-2">
            {DIRS.map(d=>(
              <button key={d} onClick={()=>setDir(d)}
                className={'py-2 rounded-lg border text-xs font-medium transition '+(dir===d?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50')}>
                {d.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Width: {w}px</label>
            <input type="range" min="10" max="200" value={w} onChange={e=>setW(Number(e.target.value))} className="w-full"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Height: {h}px</label>
            <input type="range" min="10" max="200" value={h} onChange={e=>setH(Number(e.target.value))} className="w-full"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Color</label>
            <div className="flex gap-1.5 items-center">
              <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <input value={color} onChange={e=>setColor(e.target.value)} className="flex-1 rounded border border-gray-300 px-1 py-1 font-mono text-xs"/>
            </div></div>
        </div>
        <div className="flex justify-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <div style={Object.fromEntries(element.split(';').map(s=>s.split(':').map(x=>x.trim())).filter(([k,v])=>k&&v))}/>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{css}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}