'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const PRESETS=[
  {name:'Fade In',css:'@keyframes fadeIn{from{opacity:0}to{opacity:1}}'},
  {name:'Slide Up',css:'@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}'},
  {name:'Bounce',css:'@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}'},
  {name:'Pulse',css:'@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}'},
  {name:'Spin',css:'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'},
  {name:'Shake',css:'@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}'},
  {name:'Flip',css:'@keyframes flip{0%{transform:rotateY(0)}100%{transform:rotateY(180deg)}}'},
  {name:'Swing',css:'@keyframes swing{0%,100%{transform:rotate(0)}25%{transform:rotate(10deg)}75%{transform:rotate(-10deg)}}'},
]


const tool = getToolBySlug('css-animation-generator')!

export default function CssAnimationGeneratorPage() {
  const [preset,setPreset]=useState(PRESETS[0])
  const [duration,setDuration]=useState(1)
  const [delay,setDelay]=useState(0)
  const [iterCount,setIterCount]=useState('infinite')
  const [direction,setDirection]=useState('normal')
  const [easing,setEasing]=useState('ease')
  const [fillMode,setFillMode]=useState('both')
  const [playing,setPlaying]=useState(true)
  const [copied,setCopied]=useState(false)
  const [key,setKey]=useState(0)

  const animName=preset.name.toLowerCase().replace(/\s+/g,'-')
  const shorthand=`${animName} ${duration}s ${easing} ${delay}s ${iterCount} ${direction} ${fillMode}`
  const fullCss=`${preset.css}\n\n.element {\n  animation: ${shorthand};\n}`

  function copy(){navigator.clipboard.writeText(fullCss);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  function replay(){setKey(k=>k+1)}

  useEffect(()=>{setKey(k=>k+1)},[preset,duration,delay,iterCount,direction,easing,fillMode])

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Animation Generator</h1>
        <p className="text-gray-500 mb-6">Build CSS animations with live preview</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preset Animation</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p=>(
                  <button key={p.name} onClick={()=>setPreset(p)}
                    className={'px-3 py-1.5 text-sm rounded-lg font-medium '+(preset.name===p.name?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            {[['Duration (s)',duration,0.1,10,0.1,setDuration],['Delay (s)',delay,0,5,0.1,setDelay]].map(([l,v,min,max,step,fn])=>(
              <div key={l as string}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-700">{l as string}</span><span className="font-mono text-gray-500">{v as number}s</span></div>
                <input type="range" min={min as number} max={max as number} step={step as number} value={v as number} onChange={e=>(fn as (n:number)=>void)(parseFloat(e.target.value))} className="w-full accent-brand-500" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Timing',easing,setEasing,['ease','linear','ease-in','ease-out','ease-in-out']],
                ['Direction',direction,setDirection,['normal','reverse','alternate','alternate-reverse']],
                ['Fill Mode',fillMode,setFillMode,['none','forwards','backwards','both']],
                ['Iterations',iterCount,setIterCount,['1','2','3','5','infinite']],
              ].map(([l,v,fn,opts])=>(
                <div key={l as string}>
                  <label className="block text-xs text-gray-500 mb-1">{l as string}</label>
                  <select value={v as string} onChange={e=>(fn as (s:string)=>void)(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                    {(opts as string[]).map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">Preview</span>
                <button onClick={replay} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">Replay</button>
              </div>
              <style>{`${preset.css}\n@keyframes fadeIn2{from{opacity:0}to{opacity:1}}`}</style>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl">
                <div key={key} className="w-16 h-16 rounded-xl bg-brand-500" style={{animation:shorthand}} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">CSS Output</span>
                <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
              </div>
              <pre className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap overflow-auto max-h-48">{fullCss}</pre>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}