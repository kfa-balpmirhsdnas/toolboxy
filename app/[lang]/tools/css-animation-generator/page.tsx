'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-animation-generator')!
const PRESETS:{name:string;keyframes:string;props:Record<string,string>}[]=[
  {name:'Fade In',keyframes:'from { opacity: 0; }\nto { opacity: 1; }',props:{duration:'1s',timing:'ease',iteration:'1',direction:'normal'}},
  {name:'Slide In Left',keyframes:'from { transform: translateX(-100px); opacity: 0; }\nto { transform: translateX(0); opacity: 1; }',props:{duration:'0.5s',timing:'ease-out',iteration:'1',direction:'normal'}},
  {name:'Bounce',keyframes:'0%, 100% { transform: translateY(0); }\n50% { transform: translateY(-30px); }',props:{duration:'0.8s',timing:'ease-in-out',iteration:'infinite',direction:'normal'}},
  {name:'Pulse',keyframes:'0%, 100% { transform: scale(1); }\n50% { transform: scale(1.1); }',props:{duration:'1s',timing:'ease-in-out',iteration:'infinite',direction:'normal'}},
  {name:'Rotate',keyframes:'from { transform: rotate(0deg); }\nto { transform: rotate(360deg); }',props:{duration:'2s',timing:'linear',iteration:'infinite',direction:'normal'}},
  {name:'Shake',keyframes:'0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-8px)}20%,40%,60%,80%{transform:translateX(8px)}',props:{duration:'0.8s',timing:'ease',iteration:'infinite',direction:'normal'}},
]
export default function CssAnimationGeneratorPage() {
  const [name,setName]=useState('myAnimation')
  const [kf,setKf]=useState(PRESETS[0].keyframes)
  const [duration,setDuration]=useState('1s')
  const [timing,setTiming]=useState('ease')
  const [delay,setDelay]=useState('0s')
  const [iteration,setIteration]=useState('1')
  const [direction,setDirection]=useState('normal')
  const [fill,setFill]=useState('none')
  const [playing,setPlaying]=useState(true)
  const [copied,setCopied]=useState(false)
  const applyPreset=(p:typeof PRESETS[0])=>{setKf(p.keyframes);setDuration(p.props.duration);setTiming(p.props.timing);setIteration(p.props.iteration);setDirection(p.props.direction)}
  const css=`@keyframes ${name} {\n${kf}\n}\n\n.element {\n  animation: ${name} ${duration} ${timing} ${delay} ${iteration} ${direction} ${fill};\n}`
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const styleEl={animationName:name,animationDuration:duration,animationTimingFunction:timing,animationDelay:delay,animationIterationCount:iteration,animationDirection:direction as 'normal',animationFillMode:fill as 'none',animationPlayState:playing?'running':'paused'}
  return (
    <ToolLayout tool={tool}>
      <style>{css.replace(`@keyframes ${name}`,`@keyframes ani83${name}`).replace('animation-name:'+name,'animation-name:ani83'+name)}</style>
      <style>{`@keyframes ${name} {${kf}}`}</style>
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">{PRESETS.map(p=>(
            <button key={p.name} onClick={()=>applyPreset(p)} className="px-3 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-gray-50">{p.name}</button>
          ))}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Animation name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
            <input value={duration} onChange={e=>setDuration(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Timing function</label>
            <select value={timing} onChange={e=>setTiming(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
              {['ease','ease-in','ease-out','ease-in-out','linear','step-start','step-end'].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Iteration count</label>
            <input value={iteration} onChange={e=>setIteration(e.target.value)} placeholder="1 or infinite" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Delay</label>
            <input value={delay} onChange={e=>setDelay(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Direction</label>
            <select value={direction} onChange={e=>setDirection(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
              {['normal','reverse','alternate','alternate-reverse'].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">@keyframes</label>
          <textarea value={kf} onChange={e=>setKf(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>
        <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-xl p-6">
          <div className="w-16 h-16 bg-blue-500 rounded-xl" style={styleEl}/>
          <button onClick={()=>setPlaying(p=>!p)} className="text-sm text-gray-600 hover:text-gray-900">{playing?'Pause':'Play'}</button>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
          <pre className="text-green-400 text-xs font-mono flex-1 overflow-x-auto whitespace-pre-wrap">{css}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}