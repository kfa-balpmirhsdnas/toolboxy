'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('speed-calculator')!
type Solving='speed'|'distance'|'time'
type DistUnit='km'|'mi'|'m'|'ft'
type SpeedUnit='km/h'|'mph'|'m/s'|'knots'
const toKm:Record<DistUnit,number>={km:1,mi:1.60934,m:0.001,ft:0.000304800}
const toKph:Record<SpeedUnit,number>={'km/h':1,mph:1.60934,'m/s':3.6,knots:1.852}
export default function SpeedCalculatorPage() {
  const [solving,setSolving]=useState<Solving>('speed')
  const [distance,setDistance]=useState(100)
  const [distUnit,setDistUnit]=useState<DistUnit>('km')
  const [time,setTime]=useState(1)
  const [timeUnit,setTimeUnit]=useState<'h'|'min'|'s'>('h')
  const [speed,setSpeed]=useState(100)
  const [speedUnit,setSpeedUnit]=useState<SpeedUnit>('km/h')
  const distKm=distance*toKm[distUnit]
  const timeSec=time*(timeUnit==='h'?3600:timeUnit==='min'?60:1)
  const speedKph=speed*toKph[speedUnit]
  const calc=()=>{
    if(solving==='speed'){const s=distKm/(timeSec/3600);return{label:'Speed',value:(s/toKph[speedUnit]).toFixed(4),unit:speedUnit}}
    if(solving==='distance'){const d=speedKph*(timeSec/3600);return{label:'Distance',value:(d/toKm[distUnit]).toFixed(4),unit:distUnit}}
    const t=distKm/speedKph;return{label:'Time',value:t.toFixed(4),unit:'hours ('+Math.floor(t)+'h '+(Math.round((t%1)*60))+'m)'}
  }
  const res=calc()
  const speeds=[{label:'Walking',kph:5},{label:'Cycling',kph:20},{label:'Car (city)',kph:50},{label:'Car (highway)',kph:110},{label:'Train',kph:250},{label:'Aircraft',kph:900},{label:'Sound',kph:1235},{label:'Light',kph:1.08e9}]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-xs text-gray-500 mb-1">Calculate</label>
          <div className="flex gap-1">
            {(['speed','distance','time'] as Solving[]).map(s=>(
              <button key={s} onClick={()=>setSolving(s)}
                className={'flex-1 py-2 rounded-xl border text-sm capitalize font-medium transition '+(solving===s?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{s}</button>
            ))}
          </div>
        </div>
        {solving!=='distance'&&(
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Distance</label>
              <input type="number" value={distance} onChange={e=>setDistance(Number(e.target.value))} min="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Unit</label>
              <select value={distUnit} onChange={e=>setDistUnit(e.target.value as DistUnit)} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
                {(['km','mi','m','ft'] as DistUnit[]).map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
        )}
        {solving!=='time'&&(
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Time</label>
              <input type="number" value={time} onChange={e=>setTime(Number(e.target.value))} min="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Unit</label>
              <select value={timeUnit} onChange={e=>setTimeUnit(e.target.value as 'h'|'min'|'s')} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
                <option value="h">h</option><option value="min">min</option><option value="s">s</option></select></div>
          </div>
        )}
        {solving!=='speed'&&(
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Speed</label>
              <input type="number" value={speed} onChange={e=>setSpeed(Number(e.target.value))} min="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Unit</label>
              <select value={speedUnit} onChange={e=>setSpeedUnit(e.target.value as SpeedUnit)} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
                {(['km/h','mph','m/s','knots'] as SpeedUnit[]).map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-blue-600 font-medium mb-1">{res.label}</p>
          <p className="text-3xl font-bold text-blue-700">{res.value}</p>
          <p className="text-sm text-blue-500 mt-1">{res.unit}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Speed reference</p>
          <div className="grid grid-cols-2 gap-1.5">
            {speeds.map(s=>(
              <div key={s.label} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                <span className="text-gray-600">{s.label}</span>
                <span className="font-mono font-medium text-gray-800">{s.kph>=1000?s.kph.toLocaleString():s.kph} km/h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}