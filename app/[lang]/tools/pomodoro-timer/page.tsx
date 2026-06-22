'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('pomodoro-timer')!
type Phase='work'|'short'|'long'
const PHASES:{id:Phase;label:string;default:number;color:string}[]=[
  {id:'work',label:'Focus',default:25,color:'#ef4444'},
  {id:'short',label:'Short Break',default:5,color:'#22c55e'},
  {id:'long',label:'Long Break',default:15,color:'#3b82f6'},
]
export default function PomodoroTimerPage() {
  const [phase,setPhase]=useState<Phase>('work')
  const [durations,setDurations]=useState({work:25,short:5,long:15})
  const [timeLeft,setTimeLeft]=useState(25*60)
  const [running,setRunning]=useState(false)
  const [sessions,setSessions]=useState(0)
  const intervalRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const phaseData=PHASES.find(p=>p.id===phase)!
  const total=durations[phase]*60
  const progress=1-timeLeft/total
  const fmt=(s:number)=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')
  const switchPhase=(p:Phase)=>{
    setPhase(p);setRunning(false);setTimeLeft(durations[p]*60)
    if(intervalRef.current)clearInterval(intervalRef.current)
  }
  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setTimeLeft(t=>{
          if(t<=1){
            setRunning(false)
            if(phase==='work')setSessions(s=>s+1)
            return 0
          }
          return t-1
        })
      },1000)
    } else if(intervalRef.current){clearInterval(intervalRef.current)}
    return ()=>{if(intervalRef.current)clearInterval(intervalRef.current)}
  },[running,phase])
  const circumference=2*Math.PI*90
  const strokeDash=circumference*(1-progress)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-6 text-center">
        <div className="flex justify-center gap-2">
          {PHASES.map(p=>(
            <button key={p.id} onClick={()=>switchPhase(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${phase===p.id?'text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={phase===p.id?{background:phaseData.color}:{}}>{p.label}</button>
          ))}
        </div>
        <div className="relative inline-flex items-center justify-center">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r="90" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
            <circle cx="110" cy="110" r="90" fill="none" stroke={phaseData.color} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={strokeDash} strokeLinecap="round" className="transition-all duration-1000"/>
          </svg>
          <div className="absolute text-center">
            <p className="text-5xl font-bold font-mono" style={{color:phaseData.color}}>{fmt(timeLeft)}</p>
            <p className="text-sm text-gray-500 mt-1">{phaseData.label}</p>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={()=>setRunning(r=>!r)}
            className="px-8 py-3 rounded-xl text-white font-bold text-lg transition" style={{background:phaseData.color}}>
            {running?'Pause':'Start'}
          </button>
          <button onClick={()=>switchPhase(phase)} className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">Reset</button>
        </div>
        <div className="flex justify-center gap-1">
          {Array.from({length:4},(_,i)=>(
            <div key={i} className="w-4 h-4 rounded-full" style={{background:i<sessions%4?phaseData.color:'#e5e7eb'}}/>
          ))}
        </div>
        <p className="text-sm text-gray-500">Sessions completed: <strong>{sessions}</strong></p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {PHASES.map(p=>(
            <div key={p.id}>
              <label className="block text-xs text-gray-500 mb-1">{p.label} (min)</label>
              <input type="number" min="1" max="60" value={durations[p.id]}
                onChange={e=>{const v=parseInt(e.target.value)||p.default;setDurations(d=>({...d,[p.id]:v}));if(phase===p.id)setTimeLeft(v*60)}}
                className="w-full rounded border border-gray-300 px-2 py-1 text-center"/>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}