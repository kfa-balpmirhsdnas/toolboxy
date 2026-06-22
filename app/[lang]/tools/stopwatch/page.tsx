'use client'
import { useState, useEffect, useRef } from 'react'

function fmtTime(ms:number):string{
  const h=Math.floor(ms/3600000)
  const m=Math.floor((ms%3600000)/60000)
  const s=Math.floor((ms%60000)/1000)
  const cs=Math.floor((ms%1000)/10)
  return (h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0')
}

export default function StopwatchPage() {
  const [elapsed,setElapsed]=useState(0)
  const [running,setRunning]=useState(false)
  const [laps,setLaps]=useState<number[]>([])
  const startRef=useRef<number>(0)
  const baseRef=useRef<number>(0)
  const rafRef=useRef<number|null>(null)

  useEffect(()=>{
    if(running){
      startRef.current=performance.now()
      function tick(){setElapsed(baseRef.current+(performance.now()-startRef.current));rafRef.current=requestAnimationFrame(tick)}
      rafRef.current=requestAnimationFrame(tick)
    }else{
      if(rafRef.current)cancelAnimationFrame(rafRef.current)
      baseRef.current=elapsed
    }
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)}
  },[running])

  function reset(){setRunning(false);setElapsed(0);baseRef.current=0;setLaps([])}
  function lap(){setLaps(l=>[elapsed,...l])}

  const lapStart=laps.length>0?laps[0]:0
  const lapElapsed=elapsed-lapStart
  const fastest=laps.length>1?Math.min(...laps.slice(0,-1).map((l,i)=>l-(laps[i+1]??0))):null
  const slowest=laps.length>1?Math.max(...laps.slice(0,-1).map((l,i)=>l-(laps[i+1]??0))):null

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stopwatch</h1>
        <p className="text-gray-500 mb-8">Track elapsed time with lap support and split times</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl sm:text-6xl font-mono font-bold text-gray-900 mb-2 tabular-nums">{fmtTime(elapsed)}</div>
          {running&&laps.length>0&&<div className="text-gray-400 font-mono text-lg">Lap {fmtTime(lapElapsed)}</div>}
          <div className="flex gap-3 mt-6">
            <button onClick={()=>setRunning(r=>!r)}
              className={'flex-1 py-3 rounded-xl font-semibold text-white transition-colors '+(running?'bg-orange-500 hover:bg-orange-600':'bg-green-500 hover:bg-green-600')}>
              {running?'Pause':'Start'}
            </button>
            <button onClick={running?lap:reset} className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              {running?'Lap':'Reset'}
            </button>
          </div>
        </div>
        {laps.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {laps.map((l,i)=>{
              const split=l-(laps[i+1]??0)
              const isFast=fastest!==null&&split===fastest&&laps.length>2
              const isSlow=slowest!==null&&split===slowest&&laps.length>2
              return(
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Lap {laps.length-i}</span>
                  <span className={'font-mono text-sm '+(isFast?'text-green-600 font-bold':isSlow?'text-red-500 font-bold':'text-gray-700')}>{fmtTime(split)}</span>
                  <span className="font-mono text-sm text-gray-400">{fmtTime(l)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}