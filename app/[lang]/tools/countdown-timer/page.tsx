'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('countdown-timer')!
export default function CountdownTimerPage() {
  const [targetDate,setTargetDate]=useState(()=>{const d=new Date();d.setFullYear(d.getFullYear()+1);d.setMonth(0);d.setDate(1);return d.toISOString().slice(0,16)})
  const [label,setLabel]=useState('New Year')
  const [now,setNow]=useState(new Date())
  const [seconds,setSeconds]=useState(60)
  const [timerMode,setTimerMode]=useState<'date'|'simple'>('date')
  const [running,setRunning]=useState(false)
  const [remaining,setRemaining]=useState(60)
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null)
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[])
  useEffect(()=>{
    if(running){intervalRef.current=setInterval(()=>{setRemaining(r=>{if(r<=1){clearInterval(intervalRef.current!);setRunning(false);return 0}return r-1})},1000)}
    else if(intervalRef.current){clearInterval(intervalRef.current)}
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)}
  },[running])
  const target=new Date(targetDate)
  const diff=Math.max(0,target.getTime()-now.getTime())
  const days=Math.floor(diff/86400000)
  const hours=Math.floor((diff%86400000)/3600000)
  const mins=Math.floor((diff%3600000)/60000)
  const secs=Math.floor((diff%60000)/1000)
  const fmt2=(n:number)=>String(n).padStart(2,'0')
  const pct=100-(remaining/seconds*100)
  const r=44;const circ=2*Math.PI*r
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>{setTimerMode('date');setRunning(false)}} className={'flex-1 py-2 text-sm font-medium transition '+(timerMode==='date'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Event Countdown</button>
          <button onClick={()=>{setTimerMode('simple');setRunning(false)}} className={'flex-1 py-2 text-sm font-medium transition '+(timerMode==='simple'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Simple Timer</button>
        </div>
        {timerMode==='date'?(
          <div className="space-y-3">
            <div><label className="block text-xs text-gray-600 mb-1">Event name</label>
              <input value={label} onChange={e=>setLabel(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm"/></div>
            <div><label className="block text-xs text-gray-600 mb-1">Target date & time</label>
              <input type="datetime-local" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm"/></div>
            <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
              <p className="text-sm opacity-80 mb-3">{label}</p>
              {diff>0?(
                <div className="grid grid-cols-4 gap-3">
                  {[{v:days,l:'Days'},{v:hours,l:'Hours'},{v:mins,l:'Mins'},{v:secs,l:'Secs'}].map(({v,l})=>(
                    <div key={l}>
                      <p className="text-4xl font-bold font-mono">{v<100?fmt2(v):v}</p>
                      <p className="text-xs opacity-70 mt-1">{l}</p>
                    </div>
                  ))}
                </div>
              ):<p className="text-2xl font-bold">Time is up!</p>}
            </div>
          </div>
        ):(
          <div className="space-y-4">
            <div><label className="block text-xs text-gray-600 mb-1">Duration (seconds)</label>
              <input type="number" value={seconds} onChange={e=>{const v=Math.max(1,Number(e.target.value));setSeconds(v);if(!running)setRemaining(v)}} min="1" className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xl text-center"/></div>
            <div className="flex justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle cx="60" cy="60" r={r} fill="none" stroke={remaining>0?'#3b82f6':'#ef4444'} strokeWidth="8"
                  strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.9s linear'}}/>
                <text x="60" y="64" textAnchor="middle" className="font-mono" fontSize="22" fontWeight="bold" fill={remaining>0?'#1d4ed8':'#dc2626'}>{fmt2(Math.floor(remaining/60))}:{fmt2(remaining%60)}</text>
              </svg>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={()=>setRunning(r=>!r)} disabled={remaining===0}
                className={'px-6 py-2.5 rounded-xl font-semibold text-white transition '+(remaining===0?'bg-gray-300':'running'?'bg-yellow-500 hover:bg-yellow-600':'bg-blue-600 hover:bg-blue-700')}
                style={{backgroundColor:running?'#f59e0b':undefined}}>
                {running?'Pause':'Start'}
              </button>
              <button onClick={()=>{setRunning(false);setRemaining(seconds)}} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Reset</button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}