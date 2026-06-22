'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('data-storage-converter')!
type System='decimal'|'binary'
const DEC_UNITS=['Bit','Byte','Kilobyte (KB)','Megabyte (MB)','Gigabyte (GB)','Terabyte (TB)','Petabyte (PB)','Exabyte (EB)']
const BIN_UNITS=['Bit','Byte','Kibibyte (KiB)','Mebibyte (MiB)','Gibibyte (GiB)','Tebibyte (TiB)','Pebibyte (PiB)','Exbibyte (EiB)']
const DEC_FACTORS=[1,8,8e3,8e6,8e9,8e12,8e15,8e18]
const BIN_FACTORS=[1,8,8*1024,8*1024**2,8*1024**3,8*1024**4,8*1024**5,8*1024**6]
const REF=[{label:'1 floppy disk',bits:11468800},{label:'1 CD-ROM',bits:5570000000},{label:'1 DVD (single)',bits:37600000000},{label:'1 Blu-ray',bits:200000000000},{label:'1 USB drive (16GB)',bits:128e9},{label:'1 SSD (1TB)',bits:8e12}]
export default function DataStorageConverterPage() {
  const [value,setValue]=useState(1)
  const [fromIdx,setFromIdx]=useState(3)
  const [sys,setSys]=useState<System>('decimal')
  const factors=sys==='decimal'?DEC_FACTORS:BIN_FACTORS
  const units=sys==='decimal'?DEC_UNITS:BIN_UNITS
  const bits=value*factors[fromIdx]
  const fmt=(n:number)=>{if(n===0)return'0';if(n>=1e18)return(n/1e18).toFixed(4);if(n>=1e15)return(n/1e15).toFixed(4);if(n>=1e12)return(n/1e12).toFixed(4);if(n>=1e9)return(n/1e9).toFixed(4);if(n>=1e6)return(n/1e6).toFixed(4);if(n>=1e3)return(n/1e3).toFixed(4);return parseFloat(n.toFixed(6)).toString()}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['decimal','binary'] as System[]).map(s=>(
            <button key={s} onClick={()=>setSys(s)}
              className={'flex-1 py-2 text-sm font-medium capitalize transition '+(sys===s?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>
              {s==='decimal'?'Decimal (SI)':'Binary (IEC)'}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Value</label>
            <input type="number" value={value} onChange={e=>setValue(Number(e.target.value))} min="0"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center text-xl font-bold focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">From</label>
            <select value={fromIdx} onChange={e=>setFromIdx(Number(e.target.value))} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
              {units.map((u,i)=><option key={i} value={i}>{u.split(' ')[0]}</option>)}</select></div>
        </div>
        <div className="space-y-1">
          {units.map((u,i)=>(
            <button key={i} onClick={()=>{setValue(parseFloat((bits/factors[i]).toPrecision(6)));setFromIdx(i)}}
              className={'flex items-center justify-between w-full px-4 py-2.5 rounded-xl border transition '+(i===fromIdx?'bg-blue-600 text-white border-blue-600':'bg-gray-50 border-gray-200 hover:bg-gray-100')}>
              <span className={'text-xs font-medium '+(i===fromIdx?'text-blue-100':'text-gray-500')}>{u}</span>
              <span className={'font-mono font-bold '+(i===fromIdx?'text-white':'text-gray-800')}>{fmt(bits/factors[i])}</span>
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Reference sizes</p>
          <div className="space-y-1">
            {REF.map(r=>(
              <div key={r.label} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                <span className="text-gray-600">{r.label}</span>
                <span className="font-mono text-gray-800">{fmt(r.bits/factors[fromIdx])} {units[fromIdx].split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}