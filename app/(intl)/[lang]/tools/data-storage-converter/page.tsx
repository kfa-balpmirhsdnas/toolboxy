'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
const UNITS=[
  {k:'bit',bytes:1/8},{k:'byte',bytes:1},
  {k:'kb',bytes:1024},{k:'mb',bytes:1024**2},
  {k:'gb',bytes:1024**3},{k:'tb',bytes:1024**4},
  {k:'pb',bytes:1024**5},
]
function fmt(n:number){if(n===0)return '0';if(Math.abs(n)<0.001||Math.abs(n)>1e12)return n.toExponential(3);return parseFloat(n.toPrecision(8)).toString()}
export default function Page(){
  const t = useTranslations('toolui')
  const [val,setVal]=useState('1')
  const [from,setFrom]=useState(4)
  const bytes=(parseFloat(val)||0)*UNITS[from].bytes
  const tool=TOOLS.find(t=>t.slug==='data-storage-converter')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex gap-3">
          <input value={val} onChange={e=>setVal(e.target.value)} type="number" min={0} className="flex-1 rounded border border-gray-300 px-3 py-2 text-lg font-mono"/>
          <select value={from} onChange={e=>setFrom(+e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
            {UNITS.map((u,i)=><option key={i} value={i}>{t('ds_'+u.k)}</option>)}
          </select>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {UNITS.map((u,i)=>(
            <div key={i} className={'flex justify-between px-4 py-2.5 '+(i===from?'bg-blue-50':i%2===0?'bg-white':'bg-gray-50')}>
              <span className="text-sm text-gray-600">{t('ds_'+u.k)}</span>
              <span className={'font-mono text-sm '+(i===from?'font-bold text-blue-700':'text-gray-800')}>{fmt(bytes/u.bytes)}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}