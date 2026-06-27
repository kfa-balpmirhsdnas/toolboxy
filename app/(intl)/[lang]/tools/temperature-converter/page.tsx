'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('temperature-converter')!
type Unit='C'|'F'|'K'|'R'
function toC(val:number,from:Unit):number{
  if(from==='C')return val
  if(from==='F')return(val-32)*5/9
  if(from==='K')return val-273.15
  return(val-491.67)*5/9
}
function fromC(c:number,to:Unit):number{
  if(to==='C')return c
  if(to==='F')return c*9/5+32
  if(to==='K')return c+273.15
  return c*9/5+491.67
}
const UNITS:Record<Unit,{name:string;symbol:string;color:string}>={
  C:{name:'temp_celsius',symbol:'°C',color:'#3b82f6'},
  F:{name:'temp_fahrenheit',symbol:'°F',color:'#f97316'},
  K:{name:'temp_kelvin',symbol:'K',color:'#8b5cf6'},
  R:{name:'temp_rankine',symbol:'°R',color:'#10b981'},
}
const REFS=[{label:'temp_freeze',C:0},{label:'temp_body',C:37},{label:'temp_boil',C:100},{label:'temp_abszero',C:-273.15},{label:'temp_room',C:22}]
export default function TemperatureConverterPage() {
  const t = useTranslations('toolui')
  const [srcUnit,setSrcUnit]=useState<Unit>('C')
  const [val,setVal]=useState('100')
  const num=parseFloat(val)||0
  const celsius=toC(num,srcUnit)
  const r=(to:Unit)=>parseFloat(fromC(celsius,to).toFixed(4))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(Object.keys(UNITS) as Unit[]).map(u=>(
            <button key={u} onClick={()=>setSrcUnit(u)}
              className={'flex-1 py-2 text-sm font-medium transition '+(srcUnit===u?'text-white':'bg-white text-gray-600 hover:bg-gray-50')}
              style={srcUnit===u?{background:UNITS[u].color}:{}}>
              {UNITS[u].symbol}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(UNITS[srcUnit].name)}</label>
          <input type="number" value={val} onChange={e=>setVal(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-4 text-3xl font-mono text-center font-bold focus:outline-none focus:border-blue-400"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(UNITS) as Unit[]).filter(u=>u!==srcUnit).map(u=>(
            <div key={u} className="rounded-xl border-2 p-4" style={{borderColor:UNITS[u].color+'40'}}>
              <p className="text-xs font-medium mb-1" style={{color:UNITS[u].color}}>{t(UNITS[u].name)}</p>
              <p className="text-2xl font-bold font-mono text-gray-800">{r(u).toLocaleString()}<span className="text-sm ml-1 text-gray-400">{UNITS[u].symbol}</span></p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">{t('temp_refs')}</p>
          <div className="space-y-1.5">
            {REFS.map(ref=>(
              <button key={ref.label} onClick={()=>{setSrcUnit('C');setVal(String(ref.C))}}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left">
                <span className="text-sm text-gray-600">{t(ref.label)}</span>
                <div className="flex gap-3 text-xs font-mono text-gray-500">
                  <span>{ref.C}°C</span>
                  <span>{parseFloat(fromC(ref.C,'F').toFixed(1))}°F</span>
                  <span>{parseFloat(fromC(ref.C,'K').toFixed(2))}K</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}