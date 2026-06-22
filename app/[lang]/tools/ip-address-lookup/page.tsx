'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('ip-address-lookup')!
type IpInfo={ip:string;city:string;region:string;country_name:string;postal:string;latitude:number;longitude:number;org:string;timezone:string}
export default function IpAddressLookupPage() {
  const [ip,setIp]=useState('')
  const [info,setInfo]=useState<IpInfo|null>(null)
  const [myIp,setMyIp]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const lookup=async(target?:string)=>{
    setLoading(true);setError('');setInfo(null)
    try{
      const url=target?'https://ipapi.co/'+target+'/json/':'https://ipapi.co/json/'
      const r=await fetch(url);const d=await r.json()
      if(d.error){setError(d.reason||'Not found')}else{setInfo(d)}
    }catch{setError('Request failed')}
    setLoading(false)
  }
  const getMyIp=async()=>{
    setLoading(true);setError('');setInfo(null)
    try{
      const r=await fetch('https://ipapi.co/json/');const d=await r.json()
      if(d.ip){setMyIp(d.ip);setIp(d.ip);setInfo(d)}
    }catch{setError('Failed')}
    setLoading(false)
  }
  const FIELDS=info?[
    {label:'IP Address',val:info.ip},
    {label:'City',val:info.city},
    {label:'Region',val:info.region},
    {label:'Country',val:info.country_name},
    {label:'Postal',val:info.postal},
    {label:'Latitude',val:String(info.latitude)},
    {label:'Longitude',val:String(info.longitude)},
    {label:'ISP / Org',val:info.org},
    {label:'Timezone',val:info.timezone},
  ]:[]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex gap-2">
          <input value={ip} onChange={e=>setIp(e.target.value)} placeholder="Enter IP address (e.g. 8.8.8.8)"
            className="flex-1 rounded border border-gray-300 px-3 py-2.5 font-mono" onKeyDown={e=>e.key==='Enter'&&lookup(ip)}/>
          <button onClick={()=>lookup(ip)} disabled={loading} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading?'...':'Lookup'}</button>
        </div>
        <button onClick={getMyIp} className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          {loading?'Loading...':'My IP Address'}
        </button>
        {error&&<p className="text-red-500 text-sm text-center">{error}</p>}
        {info&&(
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {FIELDS.filter(f=>f.val&&f.val!=='null').map(f=>(
              <div key={f.label} className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-gray-500">{f.label}</span>
                <span className="text-sm font-medium text-gray-800 font-mono">{f.val}</span>
              </div>
            ))}
          </div>
        )}
        {info&&info.latitude&&(
          <a href={'https://www.openstreetmap.org/?mlat='+info.latitude+'&mlon='+info.longitude+'&zoom=10'} target="_blank" rel="noopener noreferrer"
            className="block text-center py-2 rounded-lg border border-gray-200 text-sm text-blue-600 hover:bg-blue-50">View on Map</a>
        )}
        <p className="text-xs text-gray-400 text-center">Data provided by ipapi.co</p>
      </div>
    </ToolLayout>
  )
}