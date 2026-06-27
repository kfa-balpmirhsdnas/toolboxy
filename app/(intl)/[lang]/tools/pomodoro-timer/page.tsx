'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('pomodoro-timer')!
type Mode='work'|'short'|'long'
const DEFAULTS:Record<Mode,number>={work:25*60,short:5*60,long:15*60}
const LABELS:Record<Mode,string>={work:'pom_focus',short:'pom_short',long:'pom_long'}
const COLORS:Record<Mode,string>={work:'#6366f1',short:'#10b981',long:'#3b82f6'}
export default function PomodoroTimerPage() {
  const t = useTranslations('toolui')
  const [mode,setMode]=useState<Mode>('work')
  const [durations,setDurations]=useState(DEFAULTS)
  const [remaining,setRemaining]=useState(DEFAULTS.work)
  const [running,setRunning]=useState(false)
  const [sessions,setSessions]=useState(0)
  const [editing,setEditing]=useState(false)
  const intRef=useRef<ReturnType<typeof setInterval>|null>(null)
  useEffect(()=>{
    if(running){
      intRef.current=setInterval(()=>{
        setRemaining(r=>{
          if(r<=1){
            setRunning(false)
            if(mode==='work')setSessions(s=>s+1)
            try{new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...').play()}catch{}
            return 0
          }
          return r-1
        })
      },1000)
    }else if(intRef.current)clearInterval(intRef.current)
    return()=>{if(intRef.current)clearInterval(intRef.current)}
  },[running,mode])
  const switchMode=(m:Mode)=>{setMode(m);setRemaining(durations[m]);setRunning(false)}
  const reset=()=>{setRemaining(durations[mode]);setRunning(false)}
  const min=Math.floor(remaining/60),sec=remaining%60
  const pct=(1-remaining/durations[mode])*100
  const r=90,circ=2*Math.PI*r
  const dash=circ*(1-pct/100)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['work','short','long'] as Mode[]).map(m=>(
            <button key={m} onClick={()=>switchMode(m)}
              className={'flex-1 py-2 text-sm font-medium transition '+(mode===m?'text-white':'bg-white text-gray-600 hover:bg-gray-50')}
              style={mode===m?{background:COLORS[m]}:{}}>
              {t(LABELS[m])}
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12"/>
            <circle cx="110" cy="110" r={r} fill="none" stroke={COLORS[mode]} strokeWidth="12" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{transition:'stroke-dashoffset 1s linear'}}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col mt-16">
            <p className="text-5xl font-bold font-mono tabular-nums">{String(min).padStart(2,'0')}:{String(sec).padStart(2,'0')}</p>
            <p className="text-sm text-gray-500 mt-1">{t(LABELS[mode])}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition">{t('ic_reset')}</button>
          <button onClick={()=>setRunning(r=>!r)}
            className="px-10 py-3 rounded-xl font-bold text-white text-lg transition"
            style={{background:COLORS[mode]}}>
            {running?t('sw_pause'):t('sw_start')}
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">{t('pom_sessions')} <strong className="text-gray-800">{sessions}</strong></p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <button onClick={()=>setEditing(e=>!e)} className="text-xs text-blue-600 hover:underline mb-2 block">{editing?t('pom_hide'):t('pom_editdur')}</button>
          {editing&&(
            <div className="grid grid-cols-3 gap-2">
              {(['work','short','long'] as Mode[]).map(m=>(
                <div key={m}><label className="block text-xs text-gray-500 mb-1">{t(LABELS[m])} ({t('pom_min')})</label>
                  <input type="number" value={Math.round(durations[m]/60)} min="1" max="60"
                    onChange={e=>{const v=Number(e.target.value)*60;setDurations(d=>({...d,[m]:v}));if(mode===m){setRemaining(v);setRunning(false)}}}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-center"/></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}