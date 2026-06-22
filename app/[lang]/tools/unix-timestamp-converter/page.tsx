'use client'
import { useState, useEffect } from 'react'

export default function UnixTimestampConverterPage() {
  const [ts, setTs] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [now, setNow] = useState(Date.now())

  useEffect(()=>{
    const id=setInterval(()=>setNow(Date.now()),1000)
    return ()=>clearInterval(id)
  },[])

  const tsNum = parseInt(ts)
  const tsValid = !isNaN(tsNum) && tsNum >= 0
  // Auto-detect ms vs s
  const tsMs = tsValid ? (tsNum > 1e10 ? tsNum : tsNum*1000) : 0
  const tsDate = tsValid ? new Date(tsMs) : null

  const dateNum = dateInput ? new Date(dateInput).getTime() : NaN
  const dateValid = !isNaN(dateNum)
  const dateTs = dateValid ? Math.floor(dateNum/1000) : null

  function useNow(){setTs(String(Math.floor(Date.now()/1000)))}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Unix Timestamp Converter</h1>
        <p className="text-gray-500 mb-8">Convert Unix timestamps to human-readable dates and vice versa</p>

        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-brand-600 font-medium">Current Unix Timestamp</div>
            <div className="font-mono text-xl font-bold text-brand-700">{Math.floor(now/1000)}</div>
          </div>
          <button onClick={useNow} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium">Use This</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Timestamp \u2192 Date</h2>
            <input type="text" value={ts} onChange={e=>setTs(e.target.value)} placeholder="e.g. 1700000000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {tsDate&&(
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Local</span><span className="font-medium">{tsDate.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">UTC</span><span className="font-medium">{tsDate.toUTCString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">ISO 8601</span><span className="font-medium font-mono text-xs">{tsDate.toISOString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Milliseconds</span><span className="font-mono">{tsMs}</span></div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Date \u2192 Timestamp</h2>
            <input type="datetime-local" value={dateInput} onChange={e=>setDateInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {dateValid&&(
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Unix (seconds)</span><span className="font-mono font-bold text-brand-600">{dateTs}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Milliseconds</span><span className="font-mono">{dateNum}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}