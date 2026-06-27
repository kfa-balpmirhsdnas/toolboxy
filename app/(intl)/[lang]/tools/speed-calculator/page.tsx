'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('speed-calculator')!
type Solving='speed'|'distance'|'time'
type DistUnit='km'|'mi'|'m'|'ft'
type SpeedUnit='km/h'|'mph'|'m/s'|'knots'
const toKm:Record<DistUnit,number>={km:1,mi:1.60934,m:0.001,ft:0.000304800}
const toKph:Record<SpeedUnit,number>={'km/h':1,mph:1.60934,'m/s':3.6,knots:1.852}
export default function SpeedCalculatorPage() {
  const t = useTranslations('toolui')
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
    if(solving==='speed'){const s=distKm/(timeSec/3600);return{labelKey:'sp_speed',value:(s/toKph[speedUnit]).toFixed(4),unit:speedUnit}}
    if(solving==='distance'){const d=speedKph*(timeSec/3600);return{labelKey:'sp_distance',value:(d/toKm[distUnit]).toFixed(4),unit:distUnit}}
    const tm=distKm/speedKph;return{labelKey:'sp_time',value:tm.toFixed(4),unit:t('sp_hours')+' ('+Math.floor(tm)+'h '+(Math.round((tm%1)*60))+'m)'}
  }
  const res=calc()
  const speeds=[{k:'walk',kph:5},{k:'cycle',kph:20},{k:'city',kph:50},{k:'hwy',kph:110},{k:'train',kph:250},{k:'air',kph:900},{k:'sound',kph:1235},{k:'light',kph:1.08e9}]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-xs text-gray-500 mb-1">{t('sp_calc')}</label>
          <div className="flex gap-1">
            {(['speed','distance','time'] as Solving[]).map(s=>(
              <button key={s} onClick={()=>setSolving(s)}
                className={'flex-1 py-2 rounded-xl border text-sm font-medium transition '+(solving===s?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{t('sp_'+s)}</button>
            ))}
          </div>
        </div>
        {solving!=='distance'&&(
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">{t('sp_distance')}</label>
              <input type="number" value={distance} onChange={e=>setDistance(Number(e.target.value))} min="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">{t('sp_unit')}</label>
              <select value={distUnit} onChange={e=>setDistUnit(e.target.value as DistUnit)} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
                {(['km','mi','m','ft'] as DistUnit[]).map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
        )}
        {solving!=='time'&&(
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">{t('sp_time')}</label>
              <input type="number" value={time} onChange={e=>setTime(Number(e.target.value))} min="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">{t('sp_unit')}</label>
              <select value={timeUnit} onChange={e=>setTimeUnit(e.target.value as 'h'|'min'|'s')} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
                <option value="h">h</option><option value="min">min</option><option value="s">s</option></select></div>
          </div>
        )}
        {solving!=='speed'&&(
          <div className="flex gap-2">
            <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">{t('sp_speed')}</label>
              <input type="number" value={speed} onChange={e=>setSpeed(Number(e.target.value))} min="0"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">{t('sp_unit')}</label>
              <select value={speedUnit} onChange={e=>setSpeedUnit(e.target.value as SpeedUnit)} className="rounded-xl border border-gray-300 px-2 py-2.5 text-sm">
                {(['km/h','mph','m/s','knots'] as SpeedUnit[]).map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-blue-600 font-medium mb-1">{t(res.labelKey)}</p>
          <p className="text-3xl font-bold text-blue-700">{res.value}</p>
          <p className="text-sm text-blue-500 mt-1">{res.unit}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">{t('sp_ref')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {speeds.map(s=>(
              <div key={s.k} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                <span className="text-gray-600">{t('sp_r_'+s.k)}</span>
                <span className="font-mono font-medium text-gray-800">{s.kph>=1000?s.kph.toLocaleString():s.kph} km/h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}