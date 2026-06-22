'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('epoch-timestamp-converter')!
export default function EpochTimestampConverterPage() {
  const now=Date.now()
  const [epoch,setEpoch]=useState(String(Math.floor(now/1000)))
  const [dateStr,setDateStr]=useState(new Date().toISOString().slice(0,16))
  const [unit,setUnit]=useState<'s'|'ms'>('s')
  const epochNum=parseInt(epoch)
  const ms=unit==='s'?epochNum*1000:epochNum
  const d=isNaN(ms)?null:new Date(ms)
  const fromDate=()=>{
    const t=new Date(dateStr).getTime()
    if(!isNaN(t)){setEpoch(unit==='s'?String(Math.floor(t/1000)):String(t))}
  }
  const setNow=()=>{
    const t=Date.now()
    setEpoch(unit==='s'?String(Math.floor(t/1000)):String(t))
    setDateStr(new Date(t).toISOString().slice(0,16))
  }
  const ZONES=['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Seoul','Asia/Shanghai','Australia/Sydney']
  const [copied,setCopied]=useState('')
  const copy=(v:string,k:string)=>{navigator.clipboard.writeText(v);setCopied(k);setTimeout(()=>setCopied(''),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Unix Timestamp</label>
            <div className="flex gap-1">
              {(['s','ms'] as const).map(u=>(
                <button key={u} onClick={()=>{setUnit(u);if(u!==unit){setEpoch(u==='ms'?String(epochNum*1000):String(Math.floor(epochNum/1000)))}}}
                  className={'px-2 py-0.5 rounded text-xs font-mono font-medium border transition '+(unit===u?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{u}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input value={epoch} onChange={e=>setEpoch(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2.5 text-xl font-mono"/>
            <button onClick={setNow} className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">Now</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Convert from date/time</label>
          <div className="flex gap-2">
            <input type="datetime-local" value={dateStr} onChange={e=>setDateStr(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2"/>
            <button onClick={fromDate} className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Convert</button>
          </div>
        </div>
        {d&&!isNaN(d.getTime())&&(
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {[
                {label:'Seconds',val:String(Math.floor(ms/1000))},
                {label:'Milliseconds',val:String(ms)},
                {label:'ISO 8601',val:d.toISOString()},
                {label:'RFC 2822',val:d.toUTCString()},
              ].map(r=>(
                <div key={r.label} className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">{r.label}</p>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <code className="text-xs font-mono text-gray-700 truncate">{r.val}</code>
                    <button onClick={()=>copy(r.val,r.label)} className="text-xs text-blue-500 hover:underline shrink-0">{copied===r.label?'✓':'Copy'}</button>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">Time zones</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {ZONES.map(tz=>(
                  <div key={tz} className="flex justify-between items-center px-3 py-1.5 bg-gray-50 rounded text-xs">
                    <span className="text-gray-500 w-36">{tz}</span>
                    <span className="font-mono text-gray-800">{d.toLocaleString('en-US',{timeZone:tz,dateStyle:'short',timeStyle:'medium'})}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}