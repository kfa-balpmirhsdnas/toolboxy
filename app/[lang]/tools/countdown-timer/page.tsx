'use client'
import { useState, useEffect, useRef } from 'react'

export default function CountdownTimerPage() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [secs, setSecs] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = hours * 3600 + minutes * 60 + secs

  useEffect(() => {
    if (running && remaining !== null && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev === null || prev <= 1) {
            setRunning(false)
            setFinished(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const start = () => {
    if (total <= 0) return
    setRemaining(total)
    setRunning(true)
    setFinished(false)
  }
  const pause = () => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }
  const resume = () => setRunning(true)
  const reset = () => { setRunning(false); setRemaining(null); setFinished(false); if (intervalRef.current) clearInterval(intervalRef.current) }

  const display = remaining ?? total
  const h = Math.floor(display / 3600)
  const m = Math.floor((display % 3600) / 60)
  const s = display % 60
  const pct = remaining !== null && total > 0 ? (remaining / total) * 100 : 100

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Countdown Timer</h1>
        <p className="text-gray-500 mb-8 text-center">Set a countdown timer and get notified when time is up.</p>
        <div className="bg-white rounded-xl shadow p-8 space-y-6">
          {remaining === null && (
            <div className="flex gap-2 justify-center">
              {[
                { label: 'H', val: hours, set: setHours, max: 23 },
                { label: 'M', val: minutes, set: setMinutes, max: 59 },
                { label: 'S', val: secs, set: setSecs, max: 59 }
              ].map(({label, val, set, max}) => (
                <div key={label} className="text-center">
                  <input type="number" min={0} max={max}
                    className="w-20 text-center text-3xl font-bold border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={val} onChange={e => set(Math.min(max, Math.max(0, +e.target.value)))} />
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}

          {remaining !== null && (
            <div className="text-center">
              <div className={`text-7xl font-mono font-bold ${finished ? 'text-red-500' : 'text-gray-900'}`}>
                {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
              </div>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${finished ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{width: pct + '%'}} />
              </div>
              {finished && <p className="text-red-500 font-bold mt-4 text-lg">Time is up!</p>}
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {remaining === null ? (
              <button onClick={start} disabled={total === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors font-medium">
                Start
              </button>
            ) : running ? (
              <button onClick={pause} className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium">Pause</button>
            ) : (
              <button onClick={resume} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Resume</button>
            )}
            {remaining !== null && (
              <button onClick={reset} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Reset</button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {[[0,1,0],[0,5,0],[0,10,0],[0,25,0],[0,30,0],[1,0,0]].map(([hh,mm,ss]) => (
              <button key={`${hh}${mm}${ss}`}
                onClick={() => { setHours(hh); setMinutes(mm); setSecs(ss); setRemaining(null); setRunning(false); setFinished(false) }}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                {hh > 0 ? `${hh}h` : ''}{mm > 0 ? `${mm}m` : ''}{ss > 0 ? `${ss}s` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
