'use client'
import { useState, useEffect, useRef } from 'react'

export default function StopwatchPage() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current)
      }, 10)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    const cs = Math.floor((ms % 1000) / 10)
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`
  }

  const lap = () => setLaps(prev => [...prev, elapsed])
  const reset = () => { setRunning(false); setElapsed(0); setLaps([]) }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Stopwatch</h1>
        <p className="text-gray-500 mb-8 text-center">Precise stopwatch with lap recording.</p>
        <div className="bg-white rounded-xl shadow p-8 space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-gray-900 tabular-nums">
              {fmt(elapsed)}
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setRunning(!running)}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${running ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {running ? 'Pause' : elapsed === 0 ? 'Start' : 'Resume'}
            </button>
            {running && (
              <button onClick={lap} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Lap
              </button>
            )}
            {!running && elapsed > 0 && (
              <button onClick={reset} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Reset
              </button>
            )}
          </div>
          {laps.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {[...laps].reverse().map((lap, i) => {
                const n = laps.length - i
                const prev = n > 1 ? laps[n-2] : 0
                return (
                  <div key={n} className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-400">Lap {n}</span>
                    <span className="font-mono text-gray-500">+{fmt(lap - prev)}</span>
                    <span className="font-mono font-medium text-gray-800">{fmt(lap)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
