'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('unix-timestamp-converter')!
const FORMATS=['local','utc','iso','date-only','time-only']
function fmtDate(d:Date,fmt:string):string{
  if(fmt==='local')return d.toLocaleString()
  if(fmt==='utc')return d.toUTCString()
  if(fmt==='iso')return d.toISOString()
  if(fmt==='date-only')return d.toLocaleDateString()
  if(fmt==='time-only')return d.toLocaleTimeString()
  return d.toString()
}
export default function UnixTimestampConverterPage() {
  const [ts,setTs]=useState(()=>Math.floor(Date.now()/1000).toString())
  const [unit,setUnit]=useState<'s'|'ms'>('s')
  const [now,setNow]=useState(Math.floor(Date.now()/1000))
  const [dateInput,setDateInput]=useState('')
  const [copied,setCopied]=useState('')
  useEffect(()=>{const id=setInterval(()=>setNow(Math.floor(Date.now()/1000)),1000);return()=>clearInterval(id)},[])
  const tsNum=parseFloat(ts)||0
  const ms=unit==='s'?tsNum*1000:tsNum
  const date=new Date(ms)
  const valid=!isNaN(date.getTime())&&ts!==''
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1200)}
  const dateToTs=()=>{if(!dateInput)return;const d=new Date(dateInput);if(!isNaN(d.getTime())){setTs(unit==='s'?Math.floor(d.getTime()/1000).toString():d.getTime().toString())}}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div><p className="text-xs text-blue-600 font-medium">Current Unix timestamp</p>
            <p className="font-mono font-bold text-blue-800 text-xl">{now}</p></div>
          <button onClick={()=>setTs(now.toString())} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Use now</button>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
          <div className="flex gap-2">
            <input value={ts} onChange={e=>setTs(e.target.value)}
              className={'flex-1 rounded-xl border px-3 py-2.5 font-mono text-lg font-bold focus:outline-none '+(valid?'border-gray-300 focus:border-blue-400':'border-red-300 bg-red-50')}
              placeholder="Unix timestamp"/>
            <div className="flex rounded-xl overflow-hidden border border-gray-300">
              {(['s','ms'] as const).map(u=>(
                <button key={u} onClick={()=>setUnit(u)}
                  className={'px-3 text-sm font-medium transition '+(unit===u?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>{u}</button>
              ))}
            </div>
          </div>
        </div>
        {valid&&(
          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            {FORMATS.map((f,i)=>{
              const v=fmtDate(date,f)
              return(
                <div key={f} className={'flex items-center justify-between px-4 py-2.5 '+(i%2===0?'bg-white':'bg-gray-50')}>
                  <span className="text-xs font-medium text-gray-500 w-20 capitalize">{f.replace('-',' ')}</span>
                  <span className="flex-1 font-mono text-xs text-gray-800 mx-2">{v}</span>
                  <button onClick={()=>copy(v)} className="text-xs text-blue-500 hover:text-blue-700">{copied===v?'✓':'Copy'}</button>
                </div>
              )
            })}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date/time to timestamp</label>
          <div className="flex gap-2">
            <input type="datetime-local" value={dateInput} onChange={e=>setDateInput(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/>
            <button onClick={dateToTs} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700">Convert</button>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Notable timestamps</p>
          {[[0,'Unix epoch: Jan 1, 1970'],[1000000000,'Sept 9, 2001 01:46:40'],[1234567890,'Feb 13, 2009'],[2147483647,'Y2K38: Jan 19, 2038']].map(([t,l])=>(
            <button key={t} onClick={()=>setTs(t.toString())} className="w-full text-left flex justify-between px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs text-gray-600 mb-0.5">
              <span className="font-mono">{t}</span><span>{l}</span>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}