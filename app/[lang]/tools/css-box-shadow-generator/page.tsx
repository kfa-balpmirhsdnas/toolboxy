'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-box-shadow-generator')!
const PRESETS=[
  {name:'None',shadows:[{x:0,y:0,blur:0,spread:0,color:'#000000',alpha:0,inset:false}]},
  {name:'Soft',shadows:[{x:0,y:4,blur:6,spread:-1,color:'#000000',alpha:10,inset:false},{x:0,y:2,blur:4,spread:-2,color:'#000000',alpha:6,inset:false}]},
  {name:'Medium',shadows:[{x:0,y:10,blur:15,spread:-3,color:'#000000',alpha:10,inset:false},{x:0,y:4,blur:6,spread:-4,color:'#000000',alpha:5,inset:false}]},
  {name:'Strong',shadows:[{x:0,y:25,blur:50,spread:-12,color:'#000000',alpha:25,inset:false}]},
  {name:'Inner',shadows:[{x:0,y:2,blur:4,spread:0,color:'#000000',alpha:10,inset:true}]},
  {name:'Colored',shadows:[{x:0,y:10,blur:30,spread:-5,color:'#6366f1',alpha:50,inset:false}]},
]
type Shadow={x:number;y:number;blur:number;spread:number;color:string;alpha:number;inset:boolean}
function shadowCss(s:Shadow):string{
  const hex=s.color.replace('#','')
  const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16)
  const rgba='rgba('+r+','+g+','+b+','+parseFloat((s.alpha/100).toFixed(2))+')'
  return (s.inset?'inset ':'')+s.x+'px '+s.y+'px '+s.blur+'px '+s.spread+'px '+rgba
}
export default function CssBoxShadowGeneratorPage() {
  const [shadows,setShadows]=useState<Shadow[]>([{x:0,y:4,blur:6,spread:-1,color:'#000000',alpha:10,inset:false}])
  const [bg,setBg]=useState('#ffffff')
  const [copied,setCopied]=useState(false)
  const css='box-shadow: '+shadows.map(shadowCss).join(',
             ')+';'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const upd=(i:number,k:keyof Shadow,v:Shadow[keyof Shadow])=>setShadows(s=>{const n=[...s];(n[i] as Record<string,unknown>)[k]=v;return n})
  const Slider=({label,val,min,max,onChange}:{label:string;val:number;min:number;max:number;onChange:(v:number)=>void})=>(
    <div>
      <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-500">{label}</span><span className="font-mono text-blue-600">{val}px</span></div>
      <input type="range" min={min} max={max} value={val} onChange={e=>onChange(Number(e.target.value))} className="w-full"/>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.name} onClick={()=>setShadows(p.shadows.map(s=>({...s})))}
              className="px-3 py-1.5 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{p.name}</button>
          ))}
        </div>
        <div className="flex justify-center py-6" style={{background:bg==='#ffffff'?'#f3f4f6':bg}}>
          <div className="w-32 h-20 bg-white rounded-xl" style={{boxShadow:shadows.map(shadowCss).join(',')}}/>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">Card bg:</span>
          <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5"/>
          <button onClick={()=>setShadows(s=>[...s,{x:0,y:4,blur:6,spread:0,color:'#000000',alpha:10,inset:false}])} className="ml-auto text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">+ Add layer</button>
        </div>
        {shadows.map((s,i)=>(
          <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium text-gray-700">Shadow {i+1}</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={s.inset} onChange={e=>upd(i,'inset',e.target.checked)} className="rounded"/>Inset</label>
                {shadows.length>1&&<button onClick={()=>setShadows(sArr=>sArr.filter((_,j)=>j!==i))} className="text-xs text-red-400 hover:text-red-600">Remove</button>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Slider label="X offset" val={s.x} min={-50} max={50} onChange={v=>upd(i,'x',v)}/>
              <Slider label="Y offset" val={s.y} min={-50} max={50} onChange={v=>upd(i,'y',v)}/>
              <Slider label="Blur" val={s.blur} min={0} max={100} onChange={v=>upd(i,'blur',v)}/>
              <Slider label="Spread" val={s.spread} min={-50} max={50} onChange={v=>upd(i,'spread',v)}/>
            </div>
            <div className="flex gap-3 items-center">
              <input type="color" value={s.color} onChange={e=>upd(i,'color',e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5"/>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-500">Opacity</span><span className="font-mono text-blue-600">{s.alpha}%</span></div>
                <input type="range" min="0" max="100" value={s.alpha} onChange={e=>upd(i,'alpha',Number(e.target.value))} className="w-full"/>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <code className="text-green-400 font-mono text-xs whitespace-pre-wrap">{css}</code>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}