'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-base-converter')!
const BASES=[{label:'Binary',base:2,prefix:'0b'},{label:'Octal',base:8,prefix:'0o'},{label:'Decimal',base:10,prefix:''},{label:'Hex',base:16,prefix:'0x'}]
export default function NumberBaseConverterPage() {
  const [inputs,setInputs]=useState({2:'1010',8:'12',10:'10',16:'A'})
  const [error,setError]=useState('')
  const [srcBase,setSrcBase]=useState(10)
  const updateFrom=(val:string,base:number)=>{
    setError('')
    const clean=val.replace(/s/g,'').toUpperCase()
    try{
      const n=parseInt(clean||'0',base)
      if(isNaN(n)){setError('Invalid number for base '+base);return}
      const next:Record<number,string>={}
      for(const b of[2,8,10,16])next[b]=n.toString(b).toUpperCase()
      setInputs(next as any)
      setSrcBase(base)
    }catch{setError('Conversion error')}
  }
  const hexColors=['#6366f1','#ec4899','#f59e0b','#10b981']
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-3">
        {BASES.map((b,i)=>(
          <div key={b.base}>
            <label className="block text-sm font-medium mb-1" style={{color:hexColors[i]}}>{b.label} (Base {b.base})</label>
            <div className="flex items-center gap-2">
              {b.prefix&&<span className="font-mono text-xs text-gray-400">{b.prefix}</span>}
              <input value={(inputs as any)[b.base]||''} onChange={e=>updateFrom(e.target.value,b.base)}
                className={'flex-1 rounded-xl border px-3 py-3 font-mono text-xl tracking-wider text-center uppercase focus:outline-none '+(srcBase===b.base?'border-blue-400 bg-blue-50':'border-gray-200')}/>
              <button onClick={()=>navigator.clipboard.writeText((inputs as any)[b.base]||'')} className="px-2 py-2 text-xs rounded border border-gray-200 hover:bg-gray-50 text-gray-500">Copy</button>
            </div>
          </div>
        ))}
        {error&&<p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'].map(d=>(
            <button key={d} onClick={()=>updateFrom(String(parseInt(String(d),16)),10)}
              className="py-2.5 rounded-lg border border-gray-200 font-mono text-sm hover:bg-blue-50 hover:border-blue-300 transition">{d}</button>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
          {[['255','FF','377','11111111'],['1024','400','2000','10000000000'],['4096','1000','8000','1000000000000']].map(([dec,hex,oct,bin])=>(
            <div key={dec} className="flex gap-3 font-mono"><span className="w-8 text-gray-400">Dec</span><span>{dec}</span><span className="w-8 text-gray-400 ml-3">Hex</span><span>{hex}</span><span className="w-8 text-gray-400 ml-3">Oct</span><span>{oct}</span></div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}