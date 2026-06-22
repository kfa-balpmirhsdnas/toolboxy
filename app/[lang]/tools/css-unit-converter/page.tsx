'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-unit-converter')!
const UNITS=['px','em','rem','vw','vh','pt','pc','cm','mm','in','%']
function convert(val:number,from:string,base:number,vw:number,vh:number):Record<string,number>{
  let px=val
  if(from==='em')px=val*base
  else if(from==='rem')px=val*16
  else if(from==='vw')px=val*vw/100
  else if(from==='vh')px=val*vh/100
  else if(from==='pt')px=val*96/72
  else if(from==='pc')px=val*96/6
  else if(from==='cm')px=val*96/2.54
  else if(from==='mm')px=val*96/25.4
  else if(from==='in')px=val*96
  else if(from==='%')px=val*base/100
  return{
    px,em:px/base,rem:px/16,vw:px*100/vw,vh:px*100/vh,
    pt:px*72/96,pc:px*6/96,cm:px*2.54/96,mm:px*25.4/96,in:px/96,'%':px*100/base
  }
}
export default function CssUnitConverterPage() {
  const [val,setVal]=useState(16)
  const [from,setFrom]=useState('px')
  const [baseFontSize,setBaseFontSize]=useState(16)
  const [vw,setVw]=useState(1440)
  const [vh,setVh]=useState(900)
  const results=convert(val,from,baseFontSize,vw,vh)
  const fmt=(n:number)=>parseFloat(n.toFixed(4))
  const [copied,setCopied]=useState('')
  const copy=(k:string,v:number)=>{navigator.clipboard.writeText(fmt(v)+k);setCopied(k);setTimeout(()=>setCopied(''),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Value</label>
            <input type="number" value={val} onChange={e=>setVal(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-2xl font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Unit</label>
            <select value={from} onChange={e=>setFrom(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-3 font-semibold text-gray-700">
              {UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
        </div>
        <div className="flex gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5"><span className="text-gray-500">Base font:</span>
            <input type="number" value={baseFontSize} onChange={e=>setBaseFontSize(Number(e.target.value))} className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-xs"/><span className="text-gray-400">px</span></div>
          <div className="flex items-center gap-1.5"><span className="text-gray-500">Viewport:</span>
            <input type="number" value={vw} onChange={e=>setVw(Number(e.target.value))} className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs"/>
            <span className="text-gray-400">x</span>
            <input type="number" value={vh} onChange={e=>setVh(Number(e.target.value))} className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs"/>
            <span className="text-gray-400">px</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {UNITS.map(u=>{
            const v=results[u]
            const isSrc=u===from
            return(
              <button key={u} onClick={()=>copy(u,v)}
                className={'flex items-center justify-between px-3 py-2.5 rounded-xl border transition '+(isSrc?'bg-blue-600 text-white border-blue-600':'bg-gray-50 border-gray-200 hover:bg-gray-100')}>
                <span className={'font-medium '+(isSrc?'text-blue-100 text-xs':'text-gray-500 text-xs')}>{u}</span>
                <span className={'font-mono font-bold '+(isSrc?'text-white':'text-gray-800')}>{copied===u?'Copied!':fmt(v)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}