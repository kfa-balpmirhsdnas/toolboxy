'use client'
import { useState, useEffect, useRef } from 'react'

function fmt(ms: number): string {
  const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10)
  const mm=m.toString().padStart(2,'0'),ss=s.toString().padStart(2,'0'),cc=cs.toString().padStart(2,'0')
  return (h>0?h.toString().padStart(2,'0')+':':'')+mm+':'+ss+'.'+cc
}

export default function StopwatchTimer() {
  const [elapsed,setElapsed]=useState(0)
  const [running,setRunning]=useState(false)
  const [laps,setLaps]=useState<number[]>([])
  const [mode,setMode]=useState<'stopwatch'|'countdown'>('stopwatch')
  const [cdInput,setCdInput]=useState('05:00')
  const [cdMs,setCdMs]=useState(5*60*1000)
  const startRef=useRef<number|null>(null)
  const pausedRef=useRef(0)
  const rafRef=useRef<number>()

  useEffect(()=>{
    if(running){
      startRef.current=Date.now()-pausedRef.current
      const tick=()=>{
        const now=Date.now()-startRef.current!
        if(mode==='countdown'){const rem=cdMs-now;if(rem<=0){setElapsed(0);setRunning(false);pausedRef.current=0;return}setElapsed(rem)}
        else setElapsed(now)
        rafRef.current=requestAnimationFrame(tick)
      }
      rafRef.current=requestAnimationFrame(tick)
    } else {
      if(rafRef.current)cancelAnimationFrame(rafRef.current)
    }
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)}
  },[running,mode,cdMs])

  const start=()=>{setRunning(true)}
  const pause=()=>{pausedRef.current=elapsed;setRunning(false)}
  const reset=()=>{setRunning(false);setElapsed(mode==='countdown'?cdMs:0);pausedRef.current=0;setLaps([])}
  const lap=()=>{if(running)setLaps(l=>[...l,elapsed])}

  const parseCd=(v:string)=>{
    setCdInput(v)
    const parts=(v||'0:0').split(':')
    const m=Number(parts[0]),s=Number(parts[1]||0)
    const ms=((!isNaN(m)?m:0)*60+(!isNaN(s)?s:0))*1000
    setCdMs(ms);setElapsed(ms);pausedRef.current=0
  }

  const pct=mode==='countdown'?(elapsed/Math.max(cdMs,1))*100:Math.min((elapsed%60000)/60000*100,100)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stopwatch & Timer</h1>
        <p className="text-gray-500 mb-8">Precise stopwatch with lap tracking, plus a countdown timer.</p>
        <div className="flex gap-2 mb-6">
          {(['stopwatch','countdown'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);reset()}} className={'px-5 py-2 rounded-xl text-sm font-medium transition-colors '+(mode===m?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600')}>
              {m==='stopwatch'?'Stopwatch':'Countdown'}
            </button>
          ))}
        </div>
        {mode==='countdown'&&!running&&elapsed===cdMs&&(
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (MM:SS)</label>
            <input type="text" value={cdInput} onChange={e=>parseCd(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="05:00"/>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 text-center">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
              <circle cx="24" cy="24" r="20" fill="none" stroke={mode==='countdown'&&elapsed<10000?'#ef4444':'#3b82f6'} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={125.6} strokeDashoffset={125.6*(1-pct/100)}
                className="transition-all duration-100"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black font-mono text-gray-900 tabular-nums">{fmt(elapsed)}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            {!running?(
              <button onClick={start} disabled={mode==='countdown'&&elapsed===0} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm disabled:opacity-40">Start</button>
            ):(
              <button onClick={pause} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm">Pause</button>
            )}
            <button onClick={reset} className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm">Reset</button>
            {mode==='stopwatch'&&<button onClick={lap} disabled={!running} className="px-5 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold text-sm disabled:opacity-40">Lap</button>}
          </div>
        </div>
        {laps.length>0&&(
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Laps</span>
              <button onClick={()=>setLaps([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
              {[...laps].reverse().map((t,i)=>{
                const idx=laps.length-i
                const prev=idx>1?laps[idx-2]:0
                const split=t-prev
                return(
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-medium text-gray-500">{'Lap '+idx}</span>
                    <span className="font-mono text-sm text-gray-500">{'+'+fmt(split)}</span>
                    <span className="font-mono text-sm font-bold text-gray-900">{fmt(t)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}