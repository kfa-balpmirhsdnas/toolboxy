'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='pace-calculator')
  const [mode,setMode]=useState<'pace'|'time'|'distance'>('pace')
  const [distance,setDistance]=useState('5')
  const [unit,setUnit]=useState<'km'|'mi'>('km')
  const [hours,setHours]=useState('0')
  const [minutes,setMinutes]=useState('25')
  const [seconds,setSeconds]=useState('0')
  const [paceMin,setPaceMin]=useState('5')
  const [paceSec,setPaceSec]=useState('0')

  const totalTimeSec=(parseInt(hours)||0)*3600+(parseInt(minutes)||0)*60+(parseInt(seconds)||0)
  const distVal=parseFloat(distance)||1
  const paceTotalSec=(parseInt(paceMin)||0)*60+(parseInt(paceSec)||0)

  function fmt(sec:number){
    const h=Math.floor(sec/3600)
    const m=Math.floor((sec%3600)/60)
    const s=Math.floor(sec%60)
    return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`
  }

  const calcPace=totalTimeSec/distVal
  const calcTime=paceTotalSec*distVal
  const calcDist=totalTimeSec/paceTotalSec

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4 max-w-md">
        <div className="flex gap-2">
          {(['pace','time','distance'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={"px-3 py-1 rounded text-sm "+(mode===m?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
              {t('pc_find_'+m)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('sp_distance')}</label>
            <input type="number" value={distance} onChange={e=>setDistance(e.target.value)}
              className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('sp_unit')}</label>
            <select value={unit} onChange={e=>setUnit(e.target.value as 'km'|'mi')}
              className="border rounded px-3 py-2">
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
        </div>
        {mode!=='time'&&(
          <div>
            <label className="block text-sm font-medium mb-1">{t('pc_time')}</label>
            <div className="flex gap-2">
              <input type="number" placeholder="0h" value={hours} onChange={e=>setHours(e.target.value)}
                className="w-16 border rounded px-2 py-2 text-center"/>
              <input type="number" placeholder="25m" value={minutes} onChange={e=>setMinutes(e.target.value)}
                className="w-16 border rounded px-2 py-2 text-center"/>
              <input type="number" placeholder="0s" value={seconds} onChange={e=>setSeconds(e.target.value)}
                className="w-16 border rounded px-2 py-2 text-center"/>
            </div>
          </div>
        )}
        {mode!=='pace'&&(
          <div>
            <label className="block text-sm font-medium mb-1">{t('pc_pace',{u:unit})}</label>
            <div className="flex gap-2">
              <input type="number" value={paceMin} onChange={e=>setPaceMin(e.target.value)}
                className="w-20 border rounded px-3 py-2" placeholder="min"/>
              <span className="py-2">:</span>
              <input type="number" value={paceSec} onChange={e=>setPaceSec(e.target.value)}
                className="w-20 border rounded px-3 py-2" placeholder="sec"/>
            </div>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          {mode==='pace'&&<><div className="text-sm text-gray-500">{t('pc_r_pace')}</div><div className="text-2xl font-bold text-blue-700">{isFinite(calcPace)?fmt(calcPace):'-'} /{unit}</div></>}
          {mode==='time'&&<><div className="text-sm text-gray-500">{t('pc_finish')}</div><div className="text-2xl font-bold text-blue-700">{isFinite(calcTime)?fmt(calcTime):'-'}</div></>}
          {mode==='distance'&&<><div className="text-sm text-gray-500">{t('sp_distance')}</div><div className="text-2xl font-bold text-blue-700">{isFinite(calcDist)&&calcDist>0?calcDist.toFixed(2):'-'} {unit}</div></>}
        </div>
      </div>
    </ToolLayout>
  )
}
