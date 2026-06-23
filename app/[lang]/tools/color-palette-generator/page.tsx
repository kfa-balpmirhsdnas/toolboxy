'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function rand255(){return Math.floor(Math.random()*256)}
function rgb2hex(r:number,g:number,b:number){return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('')}
function genPalette(base:string,type:string):string[]{
  const r=parseInt(base.slice(1,3),16),g=parseInt(base.slice(3,5),16),b=parseInt(base.slice(5,7),16)
  if(type==='complementary')return[base,rgb2hex(255-r,255-g,255-b),rgb2hex(Math.round((r+255-r)/2),Math.round((g+255-g)/2),Math.round((b+255-b)/2))]
  if(type==='triadic')return[base,rgb2hex(g,b,r),rgb2hex(b,r,g)]
  if(type==='random')return Array.from({length:5},()=>rgb2hex(rand255(),rand255(),rand255()))
  return[base,rgb2hex(Math.round(r*0.9),Math.round(g*0.7),Math.round(b*1.1)),rgb2hex(Math.round(r*0.7),Math.round(g*1.1),Math.round(b*0.9))]
}
const TYPES=['analogous','complementary','triadic','random']
export default function Page(){
  const [base,setBase]=useState('#3b82f6')
  const [type,setType]=useState('analogous')
  const [palette,setPalette]=useState(()=>genPalette('#3b82f6','analogous'))
  const [copied,setCopied]=useState('')
  const tool=TOOLS.find(t=>t.slug==='color-palette-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <label className="flex items-center gap-2 text-sm">Base<input type="color" value={base} onChange={e=>setBase(e.target.value)} className="w-10 h-10 rounded cursor-pointer"/></label>
          <div className="flex gap-1">{TYPES.map(t=><button key={t} onClick={()=>setType(t)} className={'px-3 py-1 rounded text-xs font-medium border '+(type===t?'bg-blue-600 text-white border-blue-600':'border-gray-300')}>{t}</button>)}</div>
          <button onClick={()=>setPalette(genPalette(base,type))} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">Generate</button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {palette.map((c,i)=>(
            <div key={i} className="flex flex-col items-center gap-1">
              <button onClick={()=>{navigator.clipboard?.writeText(c);setCopied(c);setTimeout(()=>setCopied(''),1500)}}
                className={'w-20 h-20 rounded-xl border-2 shadow-sm '+(copied===c?'border-blue-400':'border-gray-200')} style={{backgroundColor:c}}/>
              <span className="text-xs font-mono text-gray-600">{c.toUpperCase()}</span>
            </div>
          ))}
        </div>
        {copied&&<p className="text-sm text-blue-600 text-center">Copied {copied.toUpperCase()}</p>}
      </div>
    </ToolLayout>
  )
}