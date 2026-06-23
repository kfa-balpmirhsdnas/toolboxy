'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
type Dir='top'|'bottom'|'left'|'right'|'top-left'|'top-right'|'bottom-left'|'bottom-right'
function getCSS(dir:Dir,size:number,color:string){
  const s=size+'px'
  const t='transparent'
  const m:{[k:string]:string}={
    'top':   'border-left:'+s+' solid '+t+';border-right:'+s+' solid '+t+';border-bottom:'+s+' solid '+color+';width:0;height:0',
    'bottom':'border-left:'+s+' solid '+t+';border-right:'+s+' solid '+t+';border-top:'+s+' solid '+color+';width:0;height:0',
    'left':  'border-top:'+s+' solid '+t+';border-bottom:'+s+' solid '+t+';border-right:'+s+' solid '+color+';width:0;height:0',
    'right': 'border-top:'+s+' solid '+t+';border-bottom:'+s+' solid '+t+';border-left:'+s+' solid '+color+';width:0;height:0',
    'top-left':   'border-top:'+s+' solid '+color+';border-right:'+s+' solid '+t+';width:0;height:0',
    'top-right':  'border-top:'+s+' solid '+color+';border-left:'+s+' solid '+t+';width:0;height:0',
    'bottom-left':'border-bottom:'+s+' solid '+color+';border-right:'+s+' solid '+t+';width:0;height:0',
    'bottom-right':'border-bottom:'+s+' solid '+color+';border-left:'+s+' solid '+t+';width:0;height:0'
  }
  return m[dir]||m['top']
}
const DIRS:Dir[]=['top','bottom','left','right','top-left','top-right','bottom-left','bottom-right']
export default function Page(){
  const [dir,setDir]=useState<Dir>('top')
  const [size,setSize]=useState(50)
  const [color,setColor]=useState('#3b82f6')
  const css=getCSS(dir,size,color)
  const full='.triangle { '+css+'; display:inline-block; }'
  const tool=TOOLS.find(t=>t.slug==='css-triangle-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {DIRS.map(d=><button key={d} onClick={()=>setDir(d)} className={'px-3 py-1 rounded text-xs font-medium border '+(dir===d?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{d}</button>)}
        </div>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">Size
            <input type="range" min={10} max={200} value={size} onChange={e=>setSize(+e.target.value)} className="w-28"/>
            <span>{size}px</span></label>
          <label className="flex items-center gap-2 text-sm text-gray-700">Color
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer"/></label>
        </div>
        <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8 border border-gray-200 min-h-[140px]">
          <div style={Object.fromEntries(css.split(';').filter(Boolean).map(s=>{const[k,...v]=s.split(':');return[k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v.join(':').trim()]}))}/>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">CSS</label>
          <textarea value={full} readOnly rows={3} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(full)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy CSS</button>
      </div>
    </ToolLayout>
  )
}