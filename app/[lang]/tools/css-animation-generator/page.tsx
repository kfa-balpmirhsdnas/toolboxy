'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('css-animation-generator')!

type EasingKey = 'ease'|'ease-in'|'ease-out'|'ease-in-out'|'linear'|'bounce'|'elastic'

const EASINGS: Record<EasingKey,string> = {
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'linear': 'linear',
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

const PRESETS = [
  { name:'Fade In',    keyframes:'@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}', animName:'fadeIn' },
  { name:'Slide Up',   keyframes:'@keyframes slideUp {\n  from { transform: translateY(40px); opacity: 0; }\n  to { transform: translateY(0); opacity: 1; }\n}', animName:'slideUp' },
  { name:'Zoom In',    keyframes:'@keyframes zoomIn {\n  from { transform: scale(0.5); opacity: 0; }\n  to { transform: scale(1); opacity: 1; }\n}', animName:'zoomIn' },
  { name:'Shake',      keyframes:'@keyframes shake {\n  0%,100% { transform: translateX(0); }\n  25% { transform: translateX(-10px); }\n  75% { transform: translateX(10px); }\n}', animName:'shake' },
  { name:'Bounce',     keyframes:'@keyframes bounce {\n  0%,100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n}', animName:'bounce' },
  { name:'Spin',       keyframes:'@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}', animName:'spin' },
  { name:'Pulse',      keyframes:'@keyframes pulse {\n  0%,100% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n}', animName:'pulse' },
  { name:'Flip',       keyframes:'@keyframes flip {\n  from { transform: rotateY(0deg); }\n  to { transform: rotateY(360deg); }\n}', animName:'flip' },
]

export default function CssAnimationGeneratorPage({ params }: { params: { lang: string } }) {
  const [preset, setPreset] = useState(0)
  const [duration, setDuration] = useState(1)
  const [delay, setDelay] = useState(0)
  const [iterations, setIterations] = useState('infinite')
  const [easing, setEasing] = useState<EasingKey>('ease')
  const [direction, setDirection] = useState('normal')
  const [fillMode, setFillMode] = useState('both')
  const [playing, setPlaying] = useState(true)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)
  const animKey = useRef(0)

  function track() { if (!tracked.current) { trackToolUsed('css-animation-generator'); tracked.current = true } }

  const p = PRESETS[preset]
  const animCSS = `${p.keyframes}

.animated-element {
  animation-name: ${p.animName};
  animation-duration: ${duration}s;
  animation-delay: ${delay}s;
  animation-iteration-count: ${iterations};
  animation-timing-function: ${EASINGS[easing]};
  animation-direction: ${direction};
  animation-fill-mode: ${fillMode};
  animation-play-state: ${playing ? 'running' : 'paused'};
}`

  async function copy() {
    await navigator.clipboard.writeText(animCSS)
    trackToolCopy('css-animation-generator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function replay() { animKey.current++; setPlaying(false); setTimeout(()=>setPlaying(true),50) }

  const inlineStyle: React.CSSProperties = {
    animationName: p.animName,
    animationDuration: duration+'s',
    animationDelay: delay+'s',
    animationIterationCount: iterations === 'infinite' ? 'infinite' : parseInt(iterations),
    animationTimingFunction: EASINGS[easing],
    animationDirection: direction as 'normal'|'reverse'|'alternate'|'alternate-reverse',
    animationFillMode: fillMode as 'none'|'forwards'|'backwards'|'both',
    animationPlayState: playing ? 'running' : 'paused',
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <style>{p.keyframes}</style>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Preset Animation</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((pr,i)=>(
              <button key={pr.name} onClick={()=>{setPreset(i);track();replay()}}
                className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (preset===i?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {pr.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration: {duration}s</label>
            <input type="range" min={0.1} max={5} step={0.1} value={duration} onChange={e=>{setDuration(parseFloat(e.target.value));track()}} className="w-full accent-brand-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Delay: {delay}s</label>
            <input type="range" min={0} max={3} step={0.1} value={delay} onChange={e=>{setDelay(parseFloat(e.target.value));track()}} className="w-full accent-brand-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Easing</label>
            <select value={easing} onChange={e=>{setEasing(e.target.value as EasingKey);track()}} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              {(Object.keys(EASINGS) as EasingKey[]).map(k=><option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Iterations</label>
            <select value={iterations} onChange={e=>{setIterations(e.target.value);track()}} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              {['infinite','1','2','3','5'].map(v=><option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direction</label>
            <select value={direction} onChange={e=>{setDirection(e.target.value);track()}} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              {['normal','reverse','alternate','alternate-reverse'].map(v=><option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fill Mode</label>
            <select value={fillMode} onChange={e=>{setFillMode(e.target.value);track()}} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              {['none','forwards','backwards','both'].map(v=><option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl" style={{height:160}}>
          <div key={animKey.current} style={inlineStyle}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg" />
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{setPlaying(!playing);track()}}
            className="px-4 py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={()=>{replay();track()}} className="px-4 py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            ↺ Replay
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy'}</button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto">{animCSS}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
