'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('percentage-calculator')!
type Mode='pct'|'of'|'change'|'total'
const MODES=[
  {id:'pct' as Mode,label:'X% of Y = ?',aL:'Percent (X)',bL:'Total (Y)',hint:'e.g. 15% of 200'},
  {id:'of' as Mode,label:'X is ?% of Y',aL:'Part (X)',bL:'Total (Y)',hint:'e.g. 30 is ?% of 200'},
  {id:'change' as Mode,label:'% Change X to Y',aL:'From (X)',bL:'To (Y)',hint:'e.g. 100 to 125'},
  {id:'total' as Mode,label:'X is P% of total',aL:'Part (X)',bL:'Percent (P)',hint:'e.g. 30 is 15%'},
]
export default function PercentageCalculatorPage() {
  const [mode,setMode]=useState<Mode>('pct')
  const [a,setA]=useState('')
  const [b,setB]=useState('')
  const [result,setResult]=useState<string|null>(null)
  const calc=()=>{
    const na=parseFloat(a),nb=parseFloat(b)
    if(isNaN(na)||isNaN(nb))return setResult('Enter valid numbers')
    let r=''
    if(mode==='pct')r=(na*nb/100).toFixed(6).replace(/\.?0+$/,'')+' ('+na+'% of '+nb+')'
    else if(mode==='of')r=(na/nb*100).toFixed(4).replace(/\.?0+$/,'')+'%'
    else if(mode==='change')r=((nb-na)/Math.abs(na)*100).toFixed(4).replace(/\.?0+$/,'')+'%'
    else r=(na/(nb/100)).toFixed(6).replace(/\.?0+$/,'')
    setResult(r)
  }
  const cur=MODES.find(m=>m.id===mode)!
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);setResult(null)}}
              className={`rounded-lg border p-3 text-left transition ${mode===m.id?'border-blue-500 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
              <p className="text-sm font-semibold text-gray-800">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.hint}</p>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{cur.aL}</label>
            <input type="number" value={a} onChange={e=>setA(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{cur.bL}</label>
            <input type="number" value={b} onChange={e=>setB(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">Calculate</button>
        {result!==null&&<div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-green-700">{result}</p>
        </div>}
      </div>
    </ToolLayout>
  )
}