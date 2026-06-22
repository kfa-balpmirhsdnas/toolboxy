'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('stopwatch')!

function pad(n: number, d = 2) { return String(n).padStart(d,'0') }

function fmt(ms: number) {
  const h = Math.floor(ms/3600000)
  const m = Math.floor((ms%3600000)/60000)
  const s = Math.floor((ms%60000)/1000)
  const cs = Math.floor((ms%1000)/10)
  return (h > 0 ? pad(h)+':' : '') + pad(m) + ':' + pad(s) + '.' + pad(cs)
}

export default function StopwatchPage({ params }: { params: { lang: string } }) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef<number>(0)
  const baseRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const tracked = useRef(false)

  useEffect(() => {
    if (running) {
      startRef.current = performance.now()
      const tick = () => {
        setElapsed(baseRef.current + performance.now() - startRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }
  }, [running])

  function start() {
    if (!tracked.current) { trackToolUsed('stopwatch'); tracked.current = true }
    setRunning(true)
  }
  function stop() { baseRef.current = elapsed; setRunning(false) }
  function reset() { setRunning(false); baseRef.current = 0; setElapsed(0); setLaps([]) }
  function lap() { setLaps(prev => [...prev, elapsed]) }

  const lapElapsed = laps.length > 0 ? elapsed - laps[laps.length-1] : elapsed

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6 text-center">
        <div className="py-8">
          <div className="text-6xl font-mono font-bold tracking-wider text-brand-700 tabular-nums">
            {fmt(elapsed)}
          </div>
          {laps.length > 0 && (
            <div className="text-sm text-gray-400 mt-2 font-mono">
              Lap {laps.length+1}: +{fmt(lapElapsed)}
            </div>
          )}
        </div>
        <div className="flex justify-center gap-3">
          {!running && elapsed === 0 && (
            <button onClick={start} className="px-8 py-3 bg-brand-600 text-white rounded-2xl text-lg font-semibold hover:bg-brand-700 transition-colors">Start</button>
          )}
          {running && (
            <>
              <button onClick={stop} className="px-6 py-3 bg-yellow-500 text-white rounded-2xl font-semibold hover:bg-yellow-600 transition-colors">Stop</button>
              <button onClick={lap} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-colors">Lap</button>
            </>
          )}
          {!running && elapsed > 0 && (
            <>
              <button onClick={start} className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-colors">Resume</button>
              <button onClick={lap} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-colors">Lap</button>
              <button onClick={reset} className="px-6 py-3 bg-red-100 text-red-600 rounded-2xl font-semibold hover:bg-red-200 transition-colors">Reset</button>
            </>
          )}
        </div>
        {laps.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Lap</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Split</th>
                  <th className="px-4 py-2 text-right text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {laps.map((t,i) => (
                  <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                    <td className="px-4 py-2 text-gray-600">#{i+1}</td>
                    <td className="px-4 py-2 text-right font-mono text-brand-600">{fmt(i===0?t:t-laps[i-1])}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600">{fmt(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
