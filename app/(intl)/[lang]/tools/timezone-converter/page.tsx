'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('timezone-converter')!
const ZONES=[
  'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
  'America/Sao_Paulo','Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow',
  'Asia/Dubai','Asia/Kolkata','Asia/Bangkok','Asia/Shanghai','Asia/Tokyo','Asia/Seoul',
  'Australia/Sydney','Pacific/Auckland','Pacific/Honolulu',
]
function fmtTime(d:Date,tz:string,invalidMsg:string):string{
  try{return d.toLocaleString('en-US',{timeZone:tz,year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}
  catch{return invalidMsg}
}
function getOffset(d:Date,tz:string):string{
  try{
    const s=d.toLocaleString('en-US',{timeZone:tz,timeZoneName:'short'})
    const m=s.match(/GMT[+-][\d:]+/)
    return m?m[0]:'UTC'
  }catch{return ''}
}
export default function TimezoneConverterPage() {
  const t = useTranslations('toolui')
  const [dt,setDt]=useState(()=>new Date().toISOString().slice(0,16))
  const [from,setFrom]=useState('UTC')
  const [zones,setZones]=useState(['America/New_York','Europe/London','Asia/Tokyo'])
  const [adding,setAdding]=useState('Asia/Seoul')
  const base=new Date(dt+'Z'.replace('Z',''))
  const addZone=()=>{if(!zones.includes(adding)){setZones([...zones,adding])}}
  const removeZone=(z:string)=>setZones(zones.filter(x=>x!==z))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tzc_datetime')}</label>
            <input type="datetime-local" value={dt} onChange={e=>setDt(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tzc_source')}</label>
            <select value={from} onChange={e=>setFrom(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
              {ZONES.map(z=><option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          {[from,...zones].map((z,i)=>{
            const d=new Date(dt)
            return (
              <div key={z} className={`flex items-center justify-between rounded-lg p-3 ${i===0?'bg-blue-50 border border-blue-200':'bg-gray-50 border border-gray-200'}`}>
                <div>
                  <p className="text-xs text-gray-500">{z}</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">{fmtTime(d,z,t('tzc_invalid'))}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{getOffset(d,z)}</p>
                  {i>0&&<button onClick={()=>removeZone(z)} className="text-xs text-red-400 hover:text-red-600 mt-1">{t('tzc_remove')}</button>}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          <select value={adding} onChange={e=>setAdding(e.target.value)} className="flex-1 rounded border border-gray-300 px-2 py-2 text-sm">
            {ZONES.filter(z=>!zones.includes(z)&&z!==from).map(z=><option key={z} value={z}>{z}</option>)}
          </select>
          <button onClick={addZone} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">{t('tzc_add')}</button>
        </div>
      </div>
    </ToolLayout>
  )
}