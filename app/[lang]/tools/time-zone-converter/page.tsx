'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const TZ_LIST=[
  {label:'UTC',tz:'UTC'},
  {label:'New York (ET)',tz:'America/New_York'},
  {label:'Los Angeles (PT)',tz:'America/Los_Angeles'},
  {label:'Chicago (CT)',tz:'America/Chicago'},
  {label:'London (BST/GMT)',tz:'Europe/London'},
  {label:'Paris (CET)',tz:'Europe/Paris'},
  {label:'Dubai (GST)',tz:'Asia/Dubai'},
  {label:'Karachi (PKT)',tz:'Asia/Karachi'},
  {label:'Mumbai (IST)',tz:'Asia/Kolkata'},
  {label:'Bangkok (ICT)',tz:'Asia/Bangkok'},
  {label:'Singapore (SGT)',tz:'Asia/Singapore'},
  {label:'Seoul (KST)',tz:'Asia/Seoul'},
  {label:'Tokyo (JST)',tz:'Asia/Tokyo'},
  {label:'Sydney (AEST)',tz:'Australia/Sydney'},
  {label:'Auckland (NZST)',tz:'Pacific/Auckland'},
  {label:'S\u00E3o Paulo (BRT)',tz:'America/Sao_Paulo'},
  {label:'Mexico City (CST)',tz:'America/Mexico_City'},
]

function formatInTz(date:Date,tz:string):string{
  return date.toLocaleString('en-US',{timeZone:tz,weekday:'short',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})
}
function offsetInTz(date:Date,tz:string):string{
  return date.toLocaleString('en-US',{timeZone:tz,timeZoneName:'short'}).split(' ').pop()||tz
}


const tool = getToolBySlug('time-zone-converter')!

export default function TimeZoneConverterPage() {
  const [now,setNow]=useState(new Date())
  const [fromTz,setFromTz]=useState('UTC')
  const [inputTime,setInputTime]=useState(new Date().toISOString().slice(0,16))
  const [selected,setSelected]=useState<string[]>(['UTC','America/New_York','Europe/London','Asia/Tokyo'])

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[]) 

  const baseDate=new Date(inputTime) 
  const displayDate=isNaN(baseDate.getTime())?now:baseDate

  function toggle(tz:string){
    setSelected(s=>s.includes(tz)?s.filter(x=>x!==tz):[...s,tz])
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Zone Converter</h1>
        <p className="text-gray-500 mb-8">Convert a time across multiple time zones simultaneously</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Date & Time</label>
            <input type="datetime-local" value={inputTime} onChange={e=>setInputTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Zones to Display</label>
            <div className="flex flex-wrap gap-1.5">
              {TZ_LIST.map(z=>(
                <button key={z.tz} onClick={()=>toggle(z.tz)}
                  className={'px-2.5 py-1 text-xs rounded-full font-medium transition-colors '+(selected.includes(z.tz)?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {TZ_LIST.filter(z=>selected.includes(z.tz)).map(z=>(
            <div key={z.tz} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{z.label}</p>
                <p className="text-xs text-gray-400">{z.tz}</p>
              </div>
              <p className="font-mono text-sm text-gray-700">{formatInTz(displayDate,z.tz)}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}