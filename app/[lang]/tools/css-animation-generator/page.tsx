'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-animation-generator')!
type Anim={name:string;keyframes:string;props:Record<string,string>}
const PRESETS:Anim[]=[
  {name:'Fade In',keyframes:'from { opacity: 0; }\nto { opacity: 1; }',props:{'animation-duration':'0.5s','animation-timing-function':'ease','animation-fill-mode':'both'}},
  {name:'Slide Up',keyframes:'from { transform: translateY(20px); opacity: 0; }\nto { transform: translateY(0); opacity: 1; }',props:{'animation-duration':'0.4s','animation-timing-function':'ease-out','animation-fill-mode':'both'}},
  {name:'Bounce',keyframes:'0%, 100% { transform: translateY(0); }\n50% { transform: translateY(-20px); }',props:{'animation-duration':'0.8s','animation-timing-function':'ease-in-out','animation-iteration-count':'infinite'}},
  {name:'Pulse',keyframes:'0%, 100% { transform: scale(1); }\n50% { transform: scale(1.05); }',props:{'animation-duration':'1s','animation-timing-function':'ease-in-out','animation-iteration-count':'infinite'}},
  {name:'Shake',keyframes:'0%, 100% { transform: translateX(0); }\n25% { transform: translateX(-8px); }\n75% { transform: translateX(8px); }',props:{'animation-duration':'0.5s','animation-timing-function':'ease-in-out','animation-iteration-count':'3'}},
  {name:'Spin',keyframes:'from { transform: rotate(0deg); }\nto { transform: rotate(360deg); }',props:{'animation-duration':'1s','animation-timing-function':'linear','animation-iteration-count':'infinite'}},
  {name:'Zoom In',keyframes:'from { transform: scale(0); opacity: 0; }\nto { transform: scale(1); opacity: 1; }',props:{'animation-duration':'0.3s','animation-timing-function':'ease-out','animation-fill-mode':'both'}},
  {name:'Flip',keyframes:'0% { transform: perspective(400px) rotateY(0deg); }\n100% { transform: perspective(400px) rotateY(360deg); }',props:{'animation-duration':'1.2s','animation-timing-function':'ease-in-out','animation-iteration-count':'infinite'}},
]
export default function CssAnimationGeneratorPage() {
  const [sel,setSel]=useState(0)
  const [running,setRunning]=useState(true)
  const [copied,setCopied]=useState(false)
  const anim=PRESETS[sel]
  const animName=anim.name.toLowerCase().replace(/s+/g,'-')
  const css='@keyframes '+animName+' {
  '+anim.keyframes.replace(/\n/g,'
  ')+'
}

.element {
'+Object.entries(anim.props).map(([k,v])=>'  '+k+': '+v+';').join('
')+'
  animation-name: '+animName+';
}'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const style={animationName:running?animName:'none',...Object.fromEntries(Object.entries(anim.props).map(([k,v])=>[k.replace(/-([a-z])/g,(_:any,c:string)=>c.toUpperCase()),v]))}
  return (
    <ToolLayout tool={tool}>
      <style dangerouslySetInnerHTML={{__html:running?'@keyframes '+animName+' {
  '+anim.keyframes.replace(/\n/g,'
  ')+'
}':''}}/>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p,i)=>(
            <button key={i} onClick={()=>{setSel(i);setRunning(true)}}
              className={'py-2 rounded-lg text-xs font-medium border transition '+(sel===i?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50 text-gray-600')}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex justify-center py-10 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl" style={style as any}/>
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={()=>setRunning(r=>!r)} className={'px-4 py-2 rounded-lg text-sm font-medium border transition '+(running?'bg-orange-100 text-orange-700 border-orange-200':'bg-green-100 text-green-700 border-green-200')}>
            {running?'Pause':'Play'}
          </button>
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Generated CSS</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-4 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}