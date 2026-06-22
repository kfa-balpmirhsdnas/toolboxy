'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const ZONES = [
  {label:'UTC',             tz:'UTC'},
  {label:'New York (ET)',   tz:'America/New_York'},
  {label:'Chicago (CT)',    tz:'America/Chicago'},
  {label:'Denver (MT)',     tz:'America/Denver'},
  {label:'Los Angeles (PT)',tz:'America/Los_Angeles'},
  {label:'London (GMT/BST)',tz:'Europe/London'},
  {label:'Paris (CET)',     tz:'Europe/Paris'},
  {label:'Berlin (CET)',    tz:'Europe/Berlin'},
  {label:'Moscow (MSK)',    tz:'Europe/Moscow'},
  {label:'Dubai (GST)',     tz:'Asia/Dubai'},
  {label:'Mumbai (IST)',    tz:'Asia/Kolkata'},
  {label:'Bangkok (ICT)',   tz:'Asia/Bangkok'},
  {label:'Singapore (SGT)', tz:'Asia/Singapore'},
  {label:'Seoul (KST)',     tz:'Asia/Seoul'},
  {label:'Tokyo (JST)',     tz:'Asia/Tokyo'},
  {label:'Sydney (AEST)',   tz:'Australia/Sydney'},
  {label:'Auckland (NZST)', tz:'Pacific/Auckland'},
]

function fmtZone(date:Date, zone:string):string {
  return date.toLocaleString('en-US',{timeZone:zone,weekday:'short',month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})
}


const tool = getToolBySlug('timezone-converter')!

export default function TimezoneConverterPage() {
  const [now, setNow] = useState(new Date())
  const [custom, setCustom] = useState('')
  const [from, setFrom] = useState('UTC')
  const [to, setTo] = useState('America/New_York')
  const [input, setInput] = useState('')
  const [converted, setConverted] = useState('')

  // Live clock
  useEffect(()=>{
    const id=setInterval(()=>setNow(new Date()),1000)
    return ()=>clearInterval(id)
  },[])

  function convert() {
    if(!input){setConverted('');return}
    try{
      const d=new Date(input)
      if(isNaN(d.getTime())){setConverted('Invalid date');return}
      setConverted(fmtZone(d,to))
    }catch{setConverted('Error converting')}
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Zone Converter</h1>
        <p className="text-gray-500 mb-6">See current time in every major time zone and convert specific times</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 mb-6">
          <h2 className="font-semibold text-gray-800">Convert a Specific Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Zone</label>
              <select value={from} onChange={e=>setFrom(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {ZONES.map(z=><option key={z.tz} value={z.tz}>{z.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Zone</label>
              <select value={to} onChange={e=>setTo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {ZONES.map(z=><option key={z.tz} value={z.tz}>{z.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time</label>
            <input type="datetime-local" value={input} onChange={e=>setInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button onClick={convert} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Convert</button>
          {converted && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Result in {ZONES.find(z=>z.tz===to)?.label}</div>
              <div className="text-lg font-semibold text-brand-700">{converted}</div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Current World Clock</h2>
          <div className="space-y-2">
            {ZONES.map(z=>(
              <div key={z.tz} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600 w-40 shrink-0">{z.label}</span>
                <span className="text-sm font-mono text-gray-800 text-right">{fmtZone(now,z.tz)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}