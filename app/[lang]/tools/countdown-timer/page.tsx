'use client'
import { useState, useEffect, useRef } from 'react'

function pad(n:number){return String(n).padStart(2,'0')}

export default function CountdownTimerPage() {
  const [target, setTarget] = useState('')
  const [label, setLabel] = useState('')
  const [now, setNow] = useState(Date.now())
  const rafRef = useRef<number|null>(null)

  useEffect(()=>{
    function tick(){setNow(Date.now());rafRef.current=requestAnimationFrame(tick)}
    rafRef.current=requestAnimationFrame(tick)
    return ()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)}
  },[])

  const targetMs = target ? new Date(target).getTime() : 0
  const diff = Math.max(0, targetMs - now)
  const expired = targetMs > 0 && diff === 0

  const totalSecs = Math.floor(diff/1000)
  const days    = Math.floor(totalSecs/86400)
  const hours   = Math.floor((totalSecs%86400)/3600)
  const minutes = Math.floor((totalSecs%3600)/60)
  const secs    = totalSecs%60

  const pct = targetMs && now < targetMs ? Math.round(((targetMs - now)/(targetMs - (targetMs - diff)))*100) : 0

  const PRESETS=[
    {label:'New Year 2027',val:'2027-01-01T00:00:00'},
    {label:'Christmas 2026',val:'2026-12-25T00:00:00'},
    {label:'Halloween 2026',val:'2026-10-31T00:00:00'},
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Countdown Timer</h1>
        <p className="text-gray-500 mb-8">Count down to any date and time with a live display</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name (optional)</label>
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. My Birthday"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date & Time</label>
            <input type="datetime-local" value={target} onChange={e=>setTarget(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p=>(
              <button key={p.val} onClick={()=>{setTarget(p.val);setLabel(p.label)}}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg">
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {targetMs>0&&(
          <div className={'mt-6 rounded-2xl border p-8 text-center transition-colors '+(expired?'bg-red-50 border-red-200':'bg-brand-50 border-brand-200')}>
            {label&&<p className={'text-lg font-semibold mb-4 '+(expired?'text-red-600':'text-brand-700')}>{label}</p>}
            {expired?(
              <div>
                <div className="text-5xl mb-3">\uD83C\uDF89</div>
                <p className="text-2xl font-bold text-red-600">Time's up!</p>
              </div>
            ):(
              <>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {([['Days',days],['Hours',hours],['Mins',minutes],['Secs',secs]] as [string,number][]).map(([l,v])=>(
                    <div key={l} className="bg-white rounded-xl border border-brand-200 py-4">
                      <div className="text-3xl sm:text-4xl font-bold text-brand-700 font-mono">{pad(v)}</div>
                      <div className="text-xs text-gray-500 mt-1">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">Until {new Date(targetMs).toLocaleString()}</p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}