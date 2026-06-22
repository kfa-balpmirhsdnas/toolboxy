'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('stopwatch-timer')!
export default function StopwatchTimerPage() {
  const [time,setTime]=useState(0)
  const [running,setRunning]=useState(false)
  const [laps,setLaps]=useState<number[]>([])
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const lastLapTime=laps.length>0?laps.reduce((a,b)=>a+b,0):0
  useEffect(()=>{
    if(running){intervalRef.current=setInterval(()=>setTime(t=>t+10),10)}
    else if(intervalRef.current)clearInterval(intervalRef.current)
    return ()=>{if(intervalRef.current)clearInterval(intervalRef.current)}
  },[running])
  const fmt=(ms:number)=>{
    const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10)
    return (h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0')
  }
  const lap=()=>{setLaps(l=>[...l,time-lastLapTime])}
  const reset=()=>{setRunning(false);setTime(0);setLaps([])}
  const minLap=laps.length>1?Math.min(...laps):null
  const maxLap=laps.length>1?Math.max(...laps):null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-6 text-center">
        <div className="bg-gray-900 rounded-2xl p-8">
          <p className="text-5xl font-bold font-mono text-white tracking-widest">{fmt(time)}</p>
          {laps.length>0&&<p className="text-gray-400 text-sm font-mono mt-2">Lap {laps.length+1}: {fmt(time-lastLapTime)}</p>}
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={()=>setRunning(r=>!r)}
            className={`px-8 py-3 rounded-xl text-white font-bold text-lg transition ${running?'bg-amber-500 hover:bg-amber-600':'bg-green-500 hover:bg-green-600'}`}>
            {running?'Pause':'Start'}
          </button>
          {running?<button onClick={lap} className="px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50">Lap</button>
                  :<button onClick={reset} className="px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50">Reset</button>}
        </div>
        {laps.length>0&&(
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            <div className="flex justify-between text-xs text-gray-500 px-2">
              <span>Lap</span><span>Lap Time</span><span>Total</span>
            </div>
            {[...laps].reverse().map((lap,i)=>{
              const lapNum=laps.length-i
              const total=laps.slice(0,lapNum).reduce((a,b)=>a+b,0)
              const isBest=minLap!==null&&lap===minLap
              const isWorst=maxLap!==null&&lap===maxLap
              return (
                <div key={lapNum} className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${isBest?'bg-green-50 text-green-700':isWorst?'bg-red-50 text-red-700':'bg-gray-50 text-gray-700'}`}>
                  <span className="font-medium w-8">#{lapNum}</span>
                  <span className="font-mono">{fmt(lap)}</span>
                  <span className="font-mono text-gray-500">{fmt(total)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}