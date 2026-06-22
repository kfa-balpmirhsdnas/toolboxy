'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('pomodoro-timer')!

type Phase = 'work'|'short-break'|'long-break'

const PHASES: Record<Phase,{label:string;color:string;bg:string}> = {
  'work':        { label:'Focus',       color:'text-red-600',   bg:'bg-red-50' },
  'short-break': { label:'Short Break', color:'text-green-600', bg:'bg-green-50' },
  'long-break':  { label:'Long Break',  color:'text-blue-600',  bg:'bg-blue-50' },
}

export default function PomodoroTimerPage({ params }: { params: { lang: string } }) {
  const [workMins, setWorkMins] = useState(25)
  const [shortMins, setShortMins] = useState(5)
  const [longMins, setLongMins] = useState(15)
  const [phase, setPhase] = useState<Phase>('work')
  const [seconds, setSeconds] = useState(25*60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('pomodoro-timer'); tracked.current = true } }

  const totalSecs = phase==='work'?workMins*60:phase==='short-break'?shortMins*60:longMins*60
  const progress = ((totalSecs-seconds)/totalSecs)*100

  const nextPhase = useCallback(() => {
    if (phase==='work') {
      const newSessions = sessions+1
      setSessions(newSessions)
      if (newSessions%4===0) { setPhase('long-break'); setSeconds(longMins*60) }
      else { setPhase('short-break'); setSeconds(shortMins*60) }
    } else { setPhase('work'); setSeconds(workMins*60) }
    setRunning(false)
    try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...').play().catch(()=>{}) } catch {}
  },[phase,sessions,workMins,shortMins,longMins])

  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setSeconds(s=>{ if(s<=1){clearInterval(intervalRef.current!);nextPhase();return 0} return s-1 })
      },1000)
    } else { clearInterval(intervalRef.current!) }
    return ()=>clearInterval(intervalRef.current!)
  },[running,nextPhase])

  function start() { track(); setRunning(true) }
  function pause() { setRunning(false) }
  function reset() { setRunning(false); setSeconds(phase==='work'?workMins*60:phase==='short-break'?shortMins*60:longMins*60) }
  function changePhase(p:Phase) { setPhase(p); setRunning(false); setSeconds(p==='work'?workMins*60:p==='short-break'?shortMins*60:longMins*60); track() }

  const mins = Math.floor(seconds/60).toString().padStart(2,'0')
  const secs = (seconds%60).toString().padStart(2,'0')
  const info = PHASES[phase]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6 max-w-sm mx-auto">
        <div className="flex gap-1 justify-center">
          {(Object.keys(PHASES) as Phase[]).map(p=>(
            <button key={p} onClick={()=>changePhase(p)}
              className={'px-3 py-1.5 rounded-lg text-xs transition-colors ' + (phase===p?'bg-gray-800 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {PHASES[p].label}
            </button>
          ))}
        </div>
        <div className={'flex flex-col items-center p-8 rounded-3xl transition-colors ' + info.bg}>
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={2*Math.PI*45} strokeDashoffset={2*Math.PI*45*(1-progress/100)}
                className={info.color} style={{transition:'stroke-dashoffset 0.5s ease'}} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={'text-4xl font-bold font-mono ' + info.color}>{mins}:{secs}</span>
              <span className="text-xs text-gray-500 mt-1">{info.label}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          {running ? (
            <button onClick={pause} className="px-6 py-3 rounded-2xl bg-gray-800 text-white font-semibold">⏸ Pause</button>
          ) : (
            <button onClick={start} className="px-6 py-3 rounded-2xl bg-gray-800 text-white font-semibold">▶ Start</button>
          )}
          <button onClick={reset} className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold">↺</button>
        </div>
        <div className="flex justify-center">
          <div className="flex gap-1">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className={'w-3 h-3 rounded-full transition-colors ' + (sessions%4>i?'bg-red-500':'bg-gray-200')} />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">{sessions} sessions</span>
        </div>
        <details className="text-sm">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">⚙ Settings</summary>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[['Focus (min)',workMins,setWorkMins],['Short break',shortMins,setShortMins],['Long break',longMins,setLongMins]].map(([l,v,set])=>(
              <div key={String(l)}>
                <label className="text-xs text-gray-500">{String(l)}</label>
                <input type="number" min={1} max={60} value={Number(v)} onChange={e=>{(set as (v:number)=>void)(parseInt(e.target.value)||1);track()}}
                  className="w-full mt-0.5 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            ))}
          </div>
        </details>
      </div>
    </ToolLayout>
  )
}
