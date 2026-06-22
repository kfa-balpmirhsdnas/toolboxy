'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('speed-distance-time-calculator')!
type Solve='speed'|'distance'|'time'
const SPEED_UNITS=[{id:'ms',label:'m/s',toMs:1},{id:'kmh',label:'km/h',toMs:1/3.6},{id:'mph',label:'mph',toMs:0.44704},{id:'knots',label:'knots',toMs:0.514444}]
const DIST_UNITS=[{id:'m',label:'m',toM:1},{id:'km',label:'km',toM:1000},{id:'mi',label:'miles',toM:1609.34},{id:'ft',label:'feet',toM:0.3048}]
const TIME_UNITS=[{id:'s',label:'sec',toS:1},{id:'m',label:'min',toS:60},{id:'h',label:'hrs',toS:3600}]
export default function SpeedDistanceTimeCalculatorPage() {
  const [solve,setSolve]=useState<Solve>('speed')
  const [speed,setSpeed]=useState('60')
  const [speedUnit,setSpeedUnit]=useState('kmh')
  const [dist,setDist]=useState('100')
  const [distUnit,setDistUnit]=useState('km')
  const [time,setTime]=useState('1')
  const [timeUnit,setTimeUnit]=useState('h')
  const su=SPEED_UNITS.find(u=>u.id===speedUnit)!
  const du=DIST_UNITS.find(u=>u.id===distUnit)!
  const tu=TIME_UNITS.find(u=>u.id===timeUnit)!
  const compute=():{val:number;unit:string}=>{
    if(solve==='speed'){
      const dm=parseFloat(dist)*du.toM,ts=parseFloat(time)*tu.toS
      if(ts===0)return{val:0,unit:speedUnit}
      return{val:(dm/ts)/su.toMs,unit:su.label}
    }
    if(solve==='distance'){
      const sms=parseFloat(speed)*su.toMs,ts=parseFloat(time)*tu.toS
      return{val:sms*ts/du.toM,unit:du.label}
    }
    const dm=parseFloat(dist)*du.toM,sms=parseFloat(speed)*su.toMs
    if(sms===0)return{val:0,unit:tu.label}
    return{val:dm/sms/tu.toS,unit:tu.label}
  }
  const res=compute()
  const UnitSelect=({units,val,set}:{units:{id:string;label:string}[];val:string;set:(v:string)=>void})=>(
    <div className="flex gap-1">
      {units.map(u=>(
        <button key={u.id} onClick={()=>set(u.id)}
          className={'px-2 py-1 rounded border text-xs font-medium transition '+(val===u.id?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{u.label}</button>
      ))}
    </div>
  )
  const Field=({label,name,val,set,units,unitVal,unitSet,disabled}:{label:string;name:Solve;val:string;set:(v:string)=>void;units:{id:string;label:string}[];unitVal:string;unitSet:(v:string)=>void;disabled:boolean})=>(
    <div className={'p-4 rounded-xl border-2 transition '+(solve===name?'border-blue-400 bg-blue-50':'border-gray-200')+(disabled?' opacity-50':'')}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700 capitalize">{label}</span>
        {!disabled&&<button onClick={()=>setSolve(name)} className={'text-xs px-2 py-0.5 rounded border transition '+(solve===name?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>
          {solve===name?'Solving for this':'Solve this'}
        </button>}
      </div>
      {disabled?<p className="text-2xl font-bold text-blue-700 font-mono">{isNaN(res.val)?'—':res.val.toFixed(4)} {res.unit}</p>
       :<input type="number" value={val} onChange={e=>set(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xl mb-2"/>}
      <UnitSelect units={units} val={disabled?(name==='speed'?speedUnit:name==='distance'?distUnit:timeUnit):unitVal} set={unitSet}/>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-3">
        <Field label="Speed" name="speed" val={speed} set={setSpeed} units={SPEED_UNITS} unitVal={speedUnit} unitSet={setSpeedUnit} disabled={solve==='speed'}/>
        <Field label="Distance" name="distance" val={dist} set={setDist} units={DIST_UNITS} unitVal={distUnit} unitSet={setDistUnit} disabled={solve==='distance'}/>
        <Field label="Time" name="time" val={time} set={setTime} units={TIME_UNITS} unitVal={timeUnit} unitSet={setTimeUnit} disabled={solve==='time'}/>
      </div>
    </ToolLayout>
  )
}