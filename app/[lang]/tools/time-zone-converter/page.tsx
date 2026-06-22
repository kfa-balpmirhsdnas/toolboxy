'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('time-zone-converter')!
const ZONES=[
  {id:'UTC',label:'UTC'},
  {id:'America/New_York',label:'New York (ET)'},
  {id:'America/Chicago',label:'Chicago (CT)'},
  {id:'America/Denver',label:'Denver (MT)'},
  {id:'America/Los_Angeles',label:'Los Angeles (PT)'},
  {id:'America/Sao_Paulo',label:'Sao Paulo'},
  {id:'Europe/London',label:'London (GMT)'},
  {id:'Europe/Paris',label:'Paris/Berlin (CET)'},
  {id:'Europe/Moscow',label:'Moscow'},
  {id:'Asia/Dubai',label:'Dubai (GST)'},
  {id:'Asia/Kolkata',label:'India (IST)'},
  {id:'Asia/Bangkok',label:'Bangkok (ICT)'},
  {id:'Asia/Singapore',label:'Singapore (SGT)'},
  {id:'Asia/Tokyo',label:'Tokyo (JST)'},
  {id:'Asia/Seoul',label:'Seoul (KST)'},
  {id:'Asia/Shanghai',label:'Shanghai (CST)'},
  {id:'Australia/Sydney',label:'Sydney (AEDT)'},
  {id:'Pacific/Auckland',label:'Auckland (NZST)'},
]
export default function TimeZoneConverterPage() {
  const [sourceZone,setSourceZone]=useState('UTC')
  const [inputTime,setInputTime]=useState(()=>new Date().toISOString().slice(0,16))
  const [selected,setSelected]=useState<string[]>(['America/New_York','Europe/London','Asia/Tokyo','Asia/Seoul'])
  const srcDate=new Date(inputTime)
  const fmt=(tz:string)=>{
    try{return new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(srcDate)}catch{return 'N/A'}
  }
  const offset=(tz:string):string=>{
    try{
      const now=new Date()
      const utcMs=now.getTime()
      const tzDate=new Date(now.toLocaleString('en-US',{timeZone:tz}))
      const diffMin=Math.round((tzDate.getTime()-utcMs)/60000)
      const h=Math.floor(Math.abs(diffMin)/60),m=Math.abs(diffMin)%60
      return (diffMin>=0?'+':'-')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')
    }catch{return ''}
  }
  const toggle=(tz:string)=>setSelected(s=>s.includes(tz)?s.filter(x=>x!==tz):[...s,tz])
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs text-gray-600 mb-1">Source date/time</label>
            <input type="datetime-local" value={inputTime} onChange={e=>setInputTime(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div className="w-44"><label className="block text-xs text-gray-600 mb-1">Source timezone</label>
            <select value={sourceZone} onChange={e=>setSourceZone(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
              {ZONES.map(z=><option key={z.id} value={z.id}>{z.label}</option>)}</select></div>
        </div>
        <div className="space-y-1.5">
          {ZONES.map(z=>{
            const active=selected.includes(z.id)||z.id===sourceZone
            if(!active&&z.id!==sourceZone)return null
            const isSource=z.id===sourceZone
            return (
              <div key={z.id} className={'flex items-center gap-3 rounded-xl px-4 py-2.5 '+(isSource?'bg-blue-600 text-white':'bg-gray-50 border border-gray-200')}>
                <div className="flex-1">
                  <p className={'text-xs '+(isSource?'opacity-80':'text-gray-500')}>{z.label} <span className="font-mono">{offset(z.id)}</span></p>
                  <p className={'font-mono font-semibold '+(isSource?'text-white':'text-gray-800')}>{fmt(z.id)}</p>
                </div>
                {!isSource&&<button onClick={()=>toggle(z.id)} className="text-gray-400 hover:text-red-400 text-lg leading-none">x</button>}
              </div>
            )
          })}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Add timezones</p>
          <div className="flex flex-wrap gap-1.5">
            {ZONES.filter(z=>!selected.includes(z.id)&&z.id!==sourceZone).map(z=>(
              <button key={z.id} onClick={()=>toggle(z.id)}
                className="px-2.5 py-1 rounded-full border border-gray-200 text-xs hover:bg-gray-50">+ {z.label}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}