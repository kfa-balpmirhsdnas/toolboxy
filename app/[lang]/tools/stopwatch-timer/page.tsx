'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('stopwatch-timer')!

interface Lap { n: number; split: number; total: number }

export default function StopwatchTimerPage({ params }: { params: { lang: string } }) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const startRef = useRef(0)
  const elapsedRef = useRef(0)
  const rafRef = useRef(0)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('stopwatch-timer'); tracked.current = true } }

  useEffect(()=>{
    if (running) {
      startRef.current = Date.now() - elapsedRef.current
      const loop = () => {
        elapsedRef.current = Date.now() - startRef.current
        setElapsed(elapsedRef.current)
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } else { cancelAnimationFrame(rafRef.current) }
    return ()=>cancelAnimationFrame(rafRef.current)
  },[running])

  function start() { track(); setRunning(true) }
  function stop() { setRunning(false) }
  function reset() { setRunning(false); elapsedRef.current=0; setElapsed(0); setLaps([]) }
  function lap() {
    const total = elapsedRef.current
    const prev = laps[0]?.total||0
    setLaps(l=>[{n:l.length+1,split:total-prev,total},...l])
    track()
  }

  function fmt(ms: number): string {
    const m = Math.floor(ms/60000); const s = Math.floor((ms%60000)/1000); const cs = Math.floor((ms%1000)/10)
    return m.toString().padStart(2,'0')+':'+s.toString().padStart(2,'0')+'.'+cs.toString().padStart(2,'0')
  }

  const bestLap = laps.length?Math.min(...laps.map(l=>l.split)):null
  const worstLap = laps.length?Math.max(...laps.map(l=>l.split)):null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="flex flex-col items-center py-8 bg-gray-50 rounded-3xl">
          <span className="text-5xl font-bold font-mono tabular-nums text-gray-800">{fmt(elapsed)}</span>
          <span className="text-xs text-gray-400 mt-1">{laps.length} laps</span>
        </div>
        <div className="flex gap-2 justify-center">
          {running ? (
            <>
              <button onClick={lap} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">Lap</button>
              <button onClick={stop} className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
            </>
          ) : elapsed===0 ? (
            <button onClick={start} className="px-8 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Start</button>
          ) : (
            <>
              <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">Reset</button>
              <button onClick={start} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Resume</button>
            </>
          )}
        </div>
        {laps.length>0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
              <span>Lap</span><span className="text-center">Split</span><span className="text-right">Total</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {laps.map(l=>(
                <div key={l.n} className={'grid grid-cols-3 px-3 py-1.5 text-xs font-mono border-b border-gray-50 ' + (l.split===bestLap?'text-green-600':l.split===worstLap?'text-red-500':'text-gray-700')}>
                  <span>#{l.n}</span>
                  <span className="text-center">{fmt(l.split)}</span>
                  <span className="text-right">{fmt(l.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
