'use client'
import { useState } from 'react'

type Stop = {color:string;pos:number}
type GradType = 'linear'|'radial'|'conic'

export default function CssGradientGeneratorPage() {
  const [stops, setStops] = useState<Stop[]>([{color:'#FF6B6B',pos:0},{color:'#4ECDC4',pos:100}])
  const [angle, setAngle] = useState(135)
  const [type, setType] = useState<GradType>('linear')
  const [copied, setCopied] = useState(false)

  function addStop(){setStops(s=>[...s,{color:'#845EC2',pos:50}].sort((a,b)=>a.pos-b.pos))}
  function removeStop(i:number){if(stops.length<=2)return;setStops(s=>s.filter((_,j)=>j!==i))}
  function updateStop(i:number,key:keyof Stop,val:string|number){setStops(s=>s.map((st,j)=>j===i?{...st,[key]:val}:st).sort((a,b)=>a.pos-b.pos))}

  const stopsStr = stops.map(s=>s.color+' '+s.pos+'%').join(', ')
  let css: string
  if(type==='linear') css='linear-gradient('+angle+'deg, '+stopsStr+')'
  else if(type==='radial') css='radial-gradient(circle, '+stopsStr+')'
  else css='conic-gradient(from '+angle+'deg, '+stopsStr+')'
  const cssRule = 'background: '+css+';'

  function copy(){navigator.clipboard.writeText(cssRule);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Gradient Generator</h1>
        <p className="text-gray-500 mb-8">Build beautiful CSS gradients visually and copy the ready-to-use code</p>
        <div className="w-full h-48 rounded-2xl mb-6 shadow-md" style={{background:css}} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="flex gap-2">
            {(['linear','radial','conic'] as GradType[]).map(t=>(
              <button key={t} onClick={()=>setType(t)}
                className={'px-4 py-2 rounded-lg capitalize font-medium transition-colors '+(type===t?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                {t}
              </button>
            ))}
          </div>
          {(type==='linear'||type==='conic')&&(
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">{type==='linear'?'Angle':'Start Angle'}</label>
                <span className="text-brand-600 font-semibold">{angle}\u00B0</span>
              </div>
              <input type="range" min={0} max={360} value={angle} onChange={e=>setAngle(parseInt(e.target.value))} className="w-full" />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Color Stops</label>
              <button onClick={addStop} className="text-xs px-3 py-1 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg">+ Add Stop</button>
            </div>
            <div className="space-y-2">
              {stops.map((s,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <input type="color" value={s.color} onChange={e=>updateStop(i,'color',e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={s.color} onChange={e=>updateStop(i,'color',e.target.value)} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 font-mono text-sm" />
                  <input type="range" min={0} max={100} value={s.pos} onChange={e=>updateStop(i,'pos',parseInt(e.target.value))} className="flex-1" />
                  <span className="text-xs text-gray-500 w-8">{s.pos}%</span>
                  <button onClick={()=>removeStop(i)} className={'text-gray-400 hover:text-red-500 '+(stops.length<=2?'invisible':'')}>\u00D7</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <code className="text-green-400 font-mono text-xs break-all">{cssRule}</code>
            <button onClick={copy} className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shrink-0">
              {copied?'\u2713 Copied':'Copy CSS'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}