'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-base-converter')!
type Base={label:string;base:number;prefix:string;pattern:RegExp}
const BASES:Base[]=[
  {label:'Binary',base:2,prefix:'0b',pattern:/^[01]*$/},
  {label:'Octal',base:8,prefix:'0o',pattern:/^[0-7]*$/},
  {label:'Decimal',base:10,prefix:'',pattern:/^[0-9]*$/},
  {label:'Hexadecimal',base:16,prefix:'0x',pattern:/^[0-9a-fA-F]*$/},
]
export default function NumberBaseConverterPage() {
  const [values,setValues]=useState<Record<number,string>>({2:'',8:'',10:'',16:''})
  const [activeBase,setActiveBase]=useState(10)
  const update=(base:number,val:string)=>{
    if(!BASES.find(b=>b.base===base)?.pattern.test(val))return
    setActiveBase(base)
    const dec=val?parseInt(val,base):NaN
    const newVals:Record<number,string>={}
    BASES.forEach(b=>{newVals[b.base]=val&&!isNaN(dec)?dec.toString(b.base).toUpperCase():b.base===base?val:''})
    setValues(newVals)
  }
  const dec=parseInt(values[10]||'0',10)
  const PRESETS=[0,1,7,8,9,10,15,16,31,32,63,64,127,128,255,256,1024,65535]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        {BASES.map(b=>(
          <div key={b.base}>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{b.label} (base {b.base})</label>
              <span className="text-xs text-gray-400 font-mono">{b.prefix}</span>
            </div>
            <input value={values[b.base]} onChange={e=>update(b.base,e.target.value)}
              placeholder={`Enter ${b.label.toLowerCase()} number...`}
              className={`w-full rounded border px-3 py-2.5 font-mono text-sm transition ${activeBase===b.base?'border-blue-500 bg-blue-50':'border-gray-300'}`}
              spellCheck={false}/>
          </div>
        ))}
        {!isNaN(dec)&&dec>=0&&<div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-500">Bits needed</p>
            <p className="font-bold text-gray-800 mt-0.5">{dec?Math.floor(Math.log2(dec))+1:1}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xs text-gray-500">Is power of 2</p>
            <p className="font-bold mt-0.5">{dec>0&&(dec&(dec-1))===0?'✅ Yes':'❌ No'}</p>
          </div>
        </div>}
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick values</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(n=>(
              <button key={n} onClick={()=>update(10,String(n))} className="px-2 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50">{n}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}