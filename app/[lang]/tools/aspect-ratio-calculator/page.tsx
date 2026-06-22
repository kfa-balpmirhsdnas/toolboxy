'use client'
import { useState } from 'react'

function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}

const PRESETS=[
  {label:'16:9',w:16,h:9},{label:'4:3',w:4,h:3},{label:'1:1',w:1,h:1},
  {label:'21:9',w:21,h:9},{label:'3:2',w:3,h:2},{label:'4:5',w:4,h:5},
  {label:'9:16',w:9,h:16},{label:'2:1',w:2,h:1},
]

export default function AspectRatioCalculatorPage() {
  const [mode, setMode] = useState<'ratio'|'dims'>('ratio')
  const [rW, setRW] = useState('16')
  const [rH, setRH] = useState('9')
  const [dimW, setDimW] = useState('')
  const [dimH, setDimH] = useState('')
  const [fixW, setFixW] = useState('')
  const [fixH, setFixH] = useState('')

  // From dimensions: compute ratio
  const dw=parseInt(dimW), dh=parseInt(dimH)
  const dimValid = !isNaN(dw)&&!isNaN(dh)&&dw>0&&dh>0
  const dimGcd = dimValid ? gcd(dw,dh) : 1
  const dimRatio = dimValid ? (dw/dimGcd)+':'+(dh/dimGcd) : ''
  const dimDec = dimValid ? (dw/dh).toFixed(4) : ''

  // From ratio: compute missing dimension
  const rwN=parseInt(rW), rhN=parseInt(rH)
  const ratioValid = !isNaN(rwN)&&!isNaN(rhN)&&rwN>0&&rhN>0
  const fwN=parseFloat(fixW), fhN=parseFloat(fixH)
  const calcH = ratioValid&&!isNaN(fwN)&&fwN>0 ? (fwN*rhN/rwN).toFixed(2) : ''
  const calcW = ratioValid&&!isNaN(fhN)&&fhN>0 ? (fhN*rwN/rhN).toFixed(2) : ''

  function applyPreset(w:number,h:number){setRW(String(w));setRH(String(h))}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aspect Ratio Calculator</h1>
        <p className="text-gray-500 mb-6">Calculate aspect ratios, find missing dimensions and explore common presets</p>
        <div className="flex gap-2 mb-6">
          {([['ratio','From Ratio'],['dims','From Dimensions']] as const).map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)}
              className={'px-4 py-2 rounded-lg font-medium transition-colors '+(mode===m?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
              {l}
            </button>
          ))}
        </div>
        {mode==='ratio' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
              <div className="flex items-center gap-3">
                <input type="number" value={rW} onChange={e=>setRW(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <span className="text-2xl font-bold text-gray-400">:</span>
                <input type="number" value={rH} onChange={e=>setRH(e.target.value)} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {PRESETS.map(p=>(<button key={p.label} onClick={()=>applyPreset(p.w,p.h)} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg">{p.label}</button>))}
              </div>
            </div>
            {ratioValid && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Known Width</label>
                  <input type="number" value={fixW} onChange={e=>setFixW(e.target.value)} placeholder="e.g. 1920" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  {calcH && <p className="text-brand-600 font-semibold mt-2">\u2192 Height: {calcH}px</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Known Height</label>
                  <input type="number" value={fixH} onChange={e=>setFixH(e.target.value)} placeholder="e.g. 1080" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  {calcW && <p className="text-brand-600 font-semibold mt-2">\u2192 Width: {calcW}px</p>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                <input type="number" value={dimW} onChange={e=>setDimW(e.target.value)} placeholder="e.g. 1920" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                <input type="number" value={dimH} onChange={e=>setDimH(e.target.value)} placeholder="e.g. 1080" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            {dimValid && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-brand-600">{dimRatio}</div>
                  <div className="text-sm text-gray-500 mt-1">Simplified Ratio</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-700">{dimDec}</div>
                  <div className="text-sm text-gray-500 mt-1">Decimal Ratio</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}