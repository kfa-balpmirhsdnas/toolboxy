'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

type Mode = 'work'|'short'|'long'

const MODES:{id:Mode;label:string;default:number}[]=[
  {id:'work',label:'Focus',default:25},
  {id:'short',label:'Short Break',default:5},
  {id:'long',label:'Long Break',default:15},
]

function pad(n:number){return String(n).padStart(2,'0')}

export default function PomodoroTimerPage() {
  const [mode,setMode]=useState<Mode>('work')
  const [durations,setDurations]=useState({work:25,short:5,long:15})
  const [secsLeft,setSecsLeft]=useState(25*60)
  const [running,setRunning]=useState(false)
  const [sessions,setSessions]=useState(0)
  const intervalRef=useRef<NodeJS.Timeout|null>(null)

  const totalSecs=durations[mode]*60
  const pct=((totalSecs-secsLeft)/totalSecs)*100
  const mins=Math.floor(secsLeft/60)
  const secs=secsLeft%60

  const switchMode=useCallback((m:Mode)=>{
    setMode(m);setRunning(false);setSecsLeft(durations[m]*60)
    if(intervalRef.current)clearInterval(intervalRef.current)
  },[durations])

  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setSecsLeft(s=>{
          if(s<=1){
            clearInterval(intervalRef.current!)
            setRunning(false)
            if(mode==='work') setSessions(n=>n+1)
            return 0
          }
          return s-1
        })
      },1000)
    }else{
      if(intervalRef.current)clearInterval(intervalRef.current)
    }
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current)}
  },[running,mode])

  function reset(){setRunning(false);setSecsLeft(durations[mode]*60)}

  const r=50,circ=2*Math.PI*r
  const dashOffset=circ*(1-pct/100)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pomodoro Timer</h1>
        <p className="text-gray-500 mb-8">Stay focused with the Pomodoro technique — 25 min focus, 5 min break</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex gap-2">
            {MODES.map(m=>(
              <button key={m.id} onClick={()=>switchMode(m.id)}
                className={'flex-1 py-2 text-sm rounded-lg font-medium transition-colors '+(mode===m.id?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="60" cy="60" r={r} fill="none" stroke="#3B82F6" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold font-mono text-gray-900">{pad(mins)}:{pad(secs)}</div>
                <div className="text-sm text-gray-400 mt-1">{MODES.find(m2=>m2.id===mode)?.label}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setRunning(r=>!r)}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors">
              {running?'Pause':'Start'}
            </button>
            <button onClick={reset} className="px-5 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              Reset
            </button>
          </div>
          <div className="flex justify-center gap-1.5">
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className={'w-4 h-4 rounded-full '+(i<sessions%4?'bg-brand-500':'bg-gray-200')} />
            ))}
          </div>
          {sessions>0&&<p className="text-center text-sm text-gray-500">{sessions} session{sessions!==1?'s':''} completed</p>}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Customize Durations</h2>
          <div className="space-y-3">
            {MODES.map(m=>(
              <div key={m.id} className="flex items-center justify-between">
                <label className="text-sm text-gray-700">{m.label} (minutes)</label>
                <input type="number" min={1} max={120}
                  value={durations[m.id]}
                  onChange={e=>{
                    const v=Math.min(120,Math.max(1,parseInt(e.target.value)||1))
                    setDurations(d=>({...d,[m.id]:v}))
                    if(mode===m.id){setSecsLeft(v*60);setRunning(false)}
                  }}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}