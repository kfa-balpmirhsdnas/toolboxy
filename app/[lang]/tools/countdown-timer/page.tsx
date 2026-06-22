'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('countdown-timer')!

function pad(n: number) { return String(n).padStart(2,'0') }

export default function CountdownTimerPage({ params }: { params: { lang: string } }) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [remaining, setRemaining] = useState<number|null>(null)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (running && remaining !== null) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev === null || prev <= 0) { setRunning(false); return 0 }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function start() {
    if (!tracked.current) { trackToolUsed('countdown-timer'); tracked.current = true }
    const total = hours * 3600 + minutes * 60 + seconds
    if (total <= 0) return
    setRemaining(total)
    setRunning(true)
  }

  function pause() { setRunning(false) }
  function resume() { if (remaining !== null && remaining > 0) setRunning(true) }
  function reset() { setRunning(false); setRemaining(null) }

  const disp = remaining !== null ? remaining : hours * 3600 + minutes * 60 + seconds
  const h = Math.floor(disp / 3600), m = Math.floor((disp % 3600) / 60), s = disp % 60
  const total = hours * 3600 + minutes * 60 + seconds
  const progress = remaining !== null && total > 0 ? (remaining / total) * 100 : 100
  const isFinished = remaining === 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6 text-center">
        {remaining === null && (
          <div className="flex items-center justify-center gap-3">
            {[['h',hours,setHours,23],['m',minutes,setMinutes,59],['s',seconds,setSeconds,59]].map(([label, val, setter, max]) => (
              <div key={String(label)} className="flex flex-col items-center">
                <input type="number" value={String(val)} min={0} max={Number(max)}
                  onChange={e => (setter as React.Dispatch<React.SetStateAction<number>>)(Math.max(0, Math.min(Number(max), parseInt(e.target.value)||0)))}
                  className="w-20 text-center text-3xl font-bold px-2 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="text-xs text-gray-500 mt-1">{label === 'h' ? 'hours' : label === 'm' ? 'minutes' : 'seconds'}</span>
              </div>
            ))}
          </div>
        )}
        {remaining !== null && (
          <div className={'text-7xl font-bold tracking-widest font-mono ' + (isFinished ? 'text-red-500 animate-pulse' : 'text-brand-700')}>
            {pad(h)}:{pad(m)}:{pad(s)}
          </div>
        )}
        {remaining !== null && !isFinished && (
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-brand-500 transition-all duration-1000" style={{ width: progress + '%' }} />
          </div>
        )}
        {isFinished && <p className="text-lg font-semibold text-red-500">\u23F0 Time\u2019s up!</p>}
        <div className="flex items-center justify-center gap-3">
          {remaining === null && (
            <button onClick={start} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">Start</button>
          )}
          {remaining !== null && !isFinished && running && (
            <button onClick={pause} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors">Pause</button>
          )}
          {remaining !== null && !isFinished && !running && (
            <button onClick={resume} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">Resume</button>
          )}
          {remaining !== null && (
            <button onClick={reset} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors">Reset</button>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[[0,1,0],[0,5,0],[0,10,0],[0,25,0],[1,0,0]].map(([h,m,s]) => (
            <button key={String(h)+String(m)+String(s)} onClick={() => { setHours(h);setMinutes(m);setSeconds(s);setRemaining(null);setRunning(false) }}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors">
              {h>0?h+'h ':''}{m>0?m+'m ':''}{s>0?s+'s':''}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
