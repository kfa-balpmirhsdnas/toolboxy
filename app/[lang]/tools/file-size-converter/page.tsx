'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('file-size-converter')!
type Unit='B'|'KB'|'MB'|'GB'|'TB'|'PB'|'KiB'|'MiB'|'GiB'|'TiB'
const UNITS:{unit:Unit;bytes:number;group:string}[]=[
  {unit:'B',bytes:1,group:'decimal'},
  {unit:'KB',bytes:1000,group:'decimal'},
  {unit:'MB',bytes:1000**2,group:'decimal'},
  {unit:'GB',bytes:1000**3,group:'decimal'},
  {unit:'TB',bytes:1000**4,group:'decimal'},
  {unit:'PB',bytes:1000**5,group:'decimal'},
  {unit:'KiB',bytes:1024,group:'binary'},
  {unit:'MiB',bytes:1024**2,group:'binary'},
  {unit:'GiB',bytes:1024**3,group:'binary'},
  {unit:'TiB',bytes:1024**4,group:'binary'},
]
function fmt(bytes:number,unit:{unit:Unit;bytes:number}):string{
  const v=bytes/unit.bytes
  if(v===0)return '0'
  if(v<0.001)return v.toExponential(3)
  if(v>=1000000)return v.toExponential(4)
  return parseFloat(v.toPrecision(6)).toString()
}
export default function FileSizeConverterPage() {
  const [val,setVal]=useState('1')
  const [fromUnit,setFromUnit]=useState<Unit>('MB')
  const from=UNITS.find(u=>u.unit===fromUnit)!
  const bytes=(parseFloat(val)||0)*from.bytes
  const REFS=[{label:'Floppy disk',bytes:1474560},{label:'CD-ROM',bytes:700e6},{label:'DVD',bytes:4.7e9},{label:'Blu-ray',bytes:25e9},{label:'Photo (JPEG)',bytes:3e6},{label:'MP3 song',bytes:5e6},{label:'4K movie',bytes:50e9}]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex gap-3">
          <input type="number" value={val} onChange={e=>setVal(e.target.value)} className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-2xl font-mono text-center font-bold focus:outline-none focus:border-blue-400"/>
          <select value={fromUnit} onChange={e=>setFromUnit(e.target.value as Unit)} className="w-28 rounded-xl border border-gray-300 px-3 py-3 font-semibold text-gray-700">
            {UNITS.map(u=><option key={u.unit} value={u.unit}>{u.unit}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Decimal (SI)</p>
          {UNITS.filter(u=>u.group==='decimal').map(u=>(
            <div key={u.unit} className={'flex items-center justify-between px-4 py-2.5 rounded-xl '+(u.unit===fromUnit?'bg-blue-600 text-white':'bg-gray-50')}>
              <span className={'text-sm font-medium '+(u.unit===fromUnit?'text-white':'text-gray-600')}>{u.unit}</span>
              <span className={'font-mono font-bold '+(u.unit===fromUnit?'text-white':'text-gray-800')}>{fmt(bytes,u)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Binary (IEC)</p>
          {UNITS.filter(u=>u.group==='binary').map(u=>(
            <div key={u.unit} className={'flex items-center justify-between px-4 py-2.5 rounded-xl '+(u.unit===fromUnit?'bg-blue-600 text-white':'bg-gray-50')}>
              <span className={'text-sm font-medium '+(u.unit===fromUnit?'text-white':'text-gray-600')}>{u.unit}</span>
              <span className={'font-mono font-bold '+(u.unit===fromUnit?'text-white':'text-gray-800')}>{fmt(bytes,u)}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Common reference sizes</p>
          <div className="flex flex-wrap gap-1.5">
            {REFS.map(r=>(
              <button key={r.label} onClick={()=>{setVal(String(r.bytes));setFromUnit('B')}}
                className="px-2.5 py-1 rounded-full border border-gray-200 text-xs hover:bg-gray-50">
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}