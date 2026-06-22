'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('css-gradient-generator')!

type GradType = 'linear'|'radial'|'conic'

export default function CssGradientGeneratorPage({ params }: { params: { lang: string } }) {
  const [type, setType] = useState<GradType>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState([{color:'#6366f1',pos:0},{color:'#ec4899',pos:50},{color:'#f97316',pos:100}])
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('css-gradient-generator'); tracked.current = true } }

  function addStop() {
    if (stops.length < 8) setStops([...stops, { color:'#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'), pos:50 }])
  }
  function removeStop(i: number) { if (stops.length > 2) setStops(stops.filter((_,idx)=>idx!==i)) }
  function updateStop(i: number, field: 'color'|'pos', val: string|number) {
    const s=[...stops]; s[i]={...s[i],[field]:val}; setStops(s); track()
  }

  const sortedStops = [...stops].sort((a,b)=>a.pos-b.pos)
  const stopStr = sortedStops.map(s=>s.color+' '+s.pos+'%').join(', ')
  const gradient = type==='linear' ? 'linear-gradient('+angle+'deg, '+stopStr+')' :
    type==='radial' ? 'radial-gradient(circle, '+stopStr+')' :
    'conic-gradient(from '+angle+'deg, '+stopStr+')'
  const cssRule = 'background: ' + gradient + ';'

  async function copy() {
    await navigator.clipboard.writeText(cssRule)
    trackToolCopy('css-gradient-generator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="h-40 rounded-2xl transition-all duration-300" style={{ background: gradient }} />
        <div className="flex gap-2">
          {(['linear','radial','conic'] as GradType[]).map(t=>(
            <button key={t} onClick={()=>{setType(t);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ' + (type===t?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t}
            </button>
          ))}
          {(type==='linear'||type==='conic') && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500">{angle}\u00B0</span>
              <input type="range" min={0} max={360} value={angle} onChange={e=>{setAngle(parseInt(e.target.value));track()}} className="w-24 accent-brand-600" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          {stops.map((stop,i)=>(
            <div key={i} className="flex items-center gap-3">
              <input type="color" value={stop.color} onChange={e=>updateStop(i,'color',e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
              <code className="text-xs font-mono text-gray-600 w-20">{stop.color}</code>
              <input type="range" min={0} max={100} value={stop.pos} onChange={e=>updateStop(i,'pos',parseInt(e.target.value))} className="flex-1 accent-brand-600" />
              <span className="text-xs font-mono text-gray-500 w-10 text-right">{stop.pos}%</span>
              {stops.length > 2 && <button onClick={()=>removeStop(i)} className="text-red-400 hover:text-red-600">\u00D7</button>}
            </div>
          ))}
        </div>
        {stops.length < 8 && <button onClick={addStop} className="text-xs text-brand-600 hover:underline">+ Add stop</button>}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
          </div>
          <code className="block p-3 bg-gray-900 text-green-400 text-xs rounded-xl font-mono break-all">{cssRule}</code>
        </div>
      </div>
    </ToolLayout>
  )
}
