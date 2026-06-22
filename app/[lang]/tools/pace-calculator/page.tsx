'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function parsePace(pace:string):number{const p=pace.split(':');return (parseInt(p[0])||0)*60+(parseInt(p[1])||0)}
function fmtPace(secs:number):string{const m=Math.floor(secs/60),s=Math.round(secs%60);return m+':'+(s<10?'0':'')+s}
function parseTime(t:string):number{const p=t.split(':');if(p.length===3)return parseInt(p[0])*3600+parseInt(p[1])*60+parseInt(p[2]);return parseInt(p[0])*60+parseInt(p[1])}
function fmtTime(secs:number):string{const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=Math.round(secs%60);return(h>0?h+':':'')+String(m).padStart(h>0?2:1,'0')+':'+String(s).padStart(2,'0')}

const RACES=[{name:'1K',km:1},{name:'5K',km:5},{name:'10K',km:10},{name:'Half',km:21.0975},{name:'Full',km:42.195}]


const tool = getToolBySlug('pace-calculator')!

export default function PaceCalculatorPage() {
  const [mode,setMode]=useState<'pace'|'time'|'distance'>('pace')
  const [distance,setDistance]=useState('5')
  const [distUnit,setDistUnit]=useState<'km'|'mi'>('km')
  const [time,setTime]=useState('30:00')
  const [paceInput,setPaceInput]=useState('6:00')

  const distKm=distUnit==='km'?parseFloat(distance)||0:(parseFloat(distance)||0)*1.60934
  const timeSecs=parseTime(time)
  const paceSecs=parsePace(paceInput)

  let result:{label:string,value:string}[]=[]
  if(mode==='pace'&&distKm>0&&timeSecs>0){
    const p=timeSecs/distKm
    result=[{label:'Pace per km',value:fmtPace(p)+' /km'},{label:'Pace per mile',value:fmtPace(p*1.60934)+' /mi'},{label:'Speed',value:(3600/p).toFixed(2)+' km/h'}]
  }else if(mode==='time'&&distKm>0&&paceSecs>0){
    const t=paceSecs*distKm
    result=[{label:'Finish Time',value:fmtTime(t)},{label:'Speed',value:(3600/paceSecs).toFixed(2)+' km/h'}]
  }else if(mode==='distance'&&timeSecs>0&&paceSecs>0){
    const d=timeSecs/paceSecs
    result=[{label:'Distance',value:d.toFixed(2)+' km'},{label:'Distance',value:(d/1.60934).toFixed(2)+' miles'}]
  }

  // Race time predictions (when pace is known)
  const raceTimes=paceSecs>0?RACES.map(r=>({...r,time:fmtTime(r.km*paceSecs)})):[]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pace Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate running pace, finish time, or distance — plus race time predictions</p>
        <div className="flex gap-2 mb-4">
          {([['pace','Find Pace'],['time','Find Time'],['distance','Find Distance']] as const).map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)} className={'flex-1 py-2 text-sm rounded-lg font-medium transition-colors '+(mode===m?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>{l}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {(mode==='pace'||mode==='time')&&(
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                <input type="number" value={distance} onChange={e=>setDistance(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              {(['km','mi'] as const).map(u=>(
                <button key={u} onClick={()=>setDistUnit(u)} className={'self-end px-3 py-2 rounded-lg font-medium mb-0.5 transition-colors '+(distUnit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
              ))}
            </div>
          )}
          {(mode==='pace'||mode==='distance')&&(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (h:mm:ss or mm:ss)</label>
              <input type="text" value={time} onChange={e=>setTime(e.target.value)} placeholder="30:00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          )}
          {(mode==='time'||mode==='distance')&&(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pace (min:sec per km)</label>
              <input type="text" value={paceInput} onChange={e=>setPaceInput(e.target.value)} placeholder="6:00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          )}
          {result.length>0&&(
            <div className="flex gap-3 mt-2">
              {result.map(r=>(
                <div key={r.label} className="flex-1 bg-brand-50 border border-brand-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-brand-700 font-mono">{r.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {raceTimes.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Race Predictions</h2>
            <div className="grid grid-cols-5 gap-2">
              {raceTimes.map(r=>(
                <div key={r.name} className="text-center bg-gray-50 rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-600 mb-1">{r.name}</div>
                  <div className="font-mono text-sm font-semibold text-brand-700">{r.time}</div>
                  <div className="text-xs text-gray-400">{r.km}km</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}