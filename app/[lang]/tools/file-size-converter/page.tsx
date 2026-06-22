'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('file-size-converter')!
type System='decimal'|'binary'
const DECIMAL_UNITS=['B','KB','MB','GB','TB','PB']
const BINARY_UNITS=['B','KiB','MiB','GiB','TiB','PiB']
const D_FACTORS=[1,1e3,1e6,1e9,1e12,1e15]
const B_FACTORS=[1,1024,1048576,1073741824,1099511627776,1125899906842624]
export default function FileSizeConverterPage() {
  const [value,setValue]=useState('1')
  const [unit,setUnit]=useState('MB')
  const [sys,setSys]=useState<System>('decimal')
  const units=sys==='decimal'?DECIMAL_UNITS:BINARY_UNITS
  const factors=sys==='decimal'?D_FACTORS:B_FACTORS
  const idx=units.indexOf(unit)
  const bytes=parseFloat(value)*(idx>=0?factors[idx]:1)
  const fmt=(v:number)=>{
    if(v<0.001)return v.toExponential(3)
    if(v<1000)return parseFloat(v.toFixed(6)).toString()
    return v.toLocaleString('en',{maximumFractionDigits:6})
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setSys('decimal')} className={'flex-1 py-2 text-sm font-medium transition '+(sys==='decimal'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Decimal (SI)</button>
          <button onClick={()=>setSys('binary')} className={'flex-1 py-2 text-sm font-medium transition '+(sys==='binary'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Binary (IEC)</button>
        </div>
        <div className="flex gap-2">
          <input type="number" value={value} onChange={e=>setValue(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2.5 text-xl font-mono"/>
          <select value={unit} onChange={e=>setUnit(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-lg font-mono">
            {units.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {units.map((u,i)=>{
            const converted=bytes/factors[i]
            return (
              <div key={u} className={'flex justify-between items-center px-4 py-3 '+(unit===u?'bg-blue-50':'')}>
                <span className={'text-sm font-mono font-semibold '+(unit===u?'text-blue-700':'text-gray-700')}>{u}</span>
                <span className={'font-mono text-sm '+(unit===u?'text-blue-700 font-bold':'text-gray-600')}>{fmt(converted)}</span>
              </div>
            )
          })}
        </div>
        {!isNaN(bytes)&&<p className="text-xs text-gray-400 text-center">{Math.round(bytes).toLocaleString()} bytes</p>}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Quick references</p>
          <div className="flex flex-wrap gap-2">
            {[['1 KB','1','KB'],['1 MB','1','MB'],['1 GB','1','GB'],['4K video (1min)','350','MB'],['720p video (1hr)','1.5','GB'],['CD','700','MB']].map(([lbl,v,u])=>(
              <button key={lbl} onClick={()=>{setValue(v);setUnit(u);setSys('decimal')}} className="px-2.5 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50">{lbl}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}