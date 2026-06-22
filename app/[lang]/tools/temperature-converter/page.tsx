'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('temperature-converter')!
type Unit='C'|'F'|'K'|'R'
const UNITS:{id:Unit;name:string;symbol:string}[]=[
  {id:'C',name:'Celsius',symbol:'°C'},
  {id:'F',name:'Fahrenheit',symbol:'°F'},
  {id:'K',name:'Kelvin',symbol:'K'},
  {id:'R',name:'Rankine',symbol:'°R'},
]
function toCelsius(v:number,from:Unit):number{
  if(from==='C')return v
  if(from==='F')return (v-32)*5/9
  if(from==='K')return v-273.15
  return (v-491.67)*5/9
}
function fromCelsius(c:number,to:Unit):number{
  if(to==='C')return c
  if(to==='F')return c*9/5+32
  if(to==='K')return c+273.15
  return (c+273.15)*9/5
}
const REFS=[{name:'Water freezing',C:0},{name:'Water boiling',C:100},{name:'Body temp',C:37},{name:'Room temp',C:22},{name:'Absolute zero',C:-273.15}]
export default function TemperatureConverterPage() {
  const [active,setActive]=useState<Unit>('C')
  const [values,setValues]=useState<Record<Unit,string>>({C:'0',F:'32',K:'273.15',R:'491.67'})
  const update=(unit:Unit,val:string)=>{
    setActive(unit)
    const n=parseFloat(val)
    if(isNaN(n)){setValues(v=>({...v,[unit]:val}));return}
    const c=toCelsius(n,unit)
    const newVals={} as Record<Unit,string>
    UNITS.forEach(u=>{newVals[u.id]=unit===u.id?val:parseFloat(fromCelsius(c,u.id).toFixed(4)).toString()})
    setValues(newVals)
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        {UNITS.map(u=>(
          <div key={u.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{u.name} ({u.symbol})</label>
            <div className="relative">
              <input type="number" value={values[u.id]} onChange={e=>update(u.id,e.target.value)}
                className={`w-full rounded border px-3 py-3 pr-12 text-xl font-mono transition ${active===u.id?'border-blue-500 bg-blue-50':'border-gray-300'}`}/>
              <span className="absolute right-3 top-3 text-lg font-bold text-gray-400">{u.symbol}</span>
            </div>
          </div>
        ))}
        <div>
          <p className="text-xs text-gray-500 mb-2">Reference temperatures</p>
          <div className="grid grid-cols-1 gap-1.5">
            {REFS.map(r=>(
              <button key={r.name} onClick={()=>update('C',String(r.C))}
                className="flex justify-between items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">
                <span className="text-gray-700">{r.name}</span>
                <span className="font-mono text-gray-500">{r.C}°C / {parseFloat(fromCelsius(r.C,'F').toFixed(1))}°F / {parseFloat((r.C+273.15).toFixed(2))}K</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}