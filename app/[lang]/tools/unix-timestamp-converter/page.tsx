'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function relTime(d:Date):string{
  const diff=(Date.now()-d.getTime())/1000
  if(Math.abs(diff)<60)return 'Just now'
  if(Math.abs(diff)<3600)return Math.round(diff/60)+'m ago'
  if(Math.abs(diff)<86400)return Math.round(diff/3600)+'h ago'
  if(diff<0)return 'In '+Math.round(-diff/86400)+' days'
  return Math.round(diff/86400)+' days ago'
}
export default function Page(){
  const [ts,setTs]=useState(Math.floor(Date.now()/1000).toString())
  const [dt,setDt]=useState(new Date().toISOString().slice(0,16))
  const fromTs=()=>{try{setDt(new Date(parseInt(ts)*1000).toISOString().slice(0,16))}catch{}}
  const fromDt=()=>{try{setTs(Math.floor(new Date(dt+'Z').getTime()/1000).toString())}catch{}}
  const now=()=>{setTs(Math.floor(Date.now()/1000).toString());setDt(new Date().toISOString().slice(0,16))}
  const d=new Date(parseInt(ts)*1000)
  const isValid=!isNaN(d.getTime())
  const tool=TOOLS.find(t=>t.slug==='unix-timestamp-converter')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <button onClick={now} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Use Now</button>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1"><label className="text-xs font-semibold text-gray-600 mb-1 block">Unix Timestamp</label>
              <input value={ts} onChange={e=>setTs(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono"/></div>
            <button onClick={fromTs} className="mt-5 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Convert</button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1"><label className="text-xs font-semibold text-gray-600 mb-1 block">Date & Time (UTC)</label>
              <input type="datetime-local" value={dt} onChange={e=>setDt(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm"/></div>
            <button onClick={fromDt} className="mt-5 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Convert</button>
          </div>
        </div>
        {isValid&&<div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            {[['UTC',d.toUTCString()],['Local',d.toLocaleString()],['ISO 8601',d.toISOString()],['Relative',relTime(d)]].map(([l,v])=>(
              <div key={l}><p className="text-xs text-gray-500">{l}</p><p className="font-mono text-xs text-gray-800 break-all">{v}</p></div>
            ))}
          </div>
        </div>}
      </div>
    </ToolLayout>
  )
}