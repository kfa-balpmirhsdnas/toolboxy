'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('ip-address-lookup')!
type IpInfo={ip:string;city?:string;region?:string;country?:string;org?:string;timezone?:string;loc?:string}
export default function IpAddressLookupPage() {
  const [ip,setIp]=useState('')
  const [info,setInfo]=useState<IpInfo|null>(null)
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const lookup=async(target?:string)=>{
    setLoading(true);setErr('');setInfo(null)
    try{
      const url=target?'https://ipinfo.io/'+target+'/json':'https://ipinfo.io/json'
      const r=await fetch(url)
      if(!r.ok)throw new Error('Lookup failed')
      const d=await r.json()
      setInfo(d)
    }catch(e){setErr('Could not fetch IP info. Try again.')}
    setLoading(false)
  }
  const rows=info?[
    {label:'IP Address',val:info.ip},
    {label:'City',val:info.city||'—'},
    {label:'Region',val:info.region||'—'},
    {label:'Country',val:info.country||'—'},
    {label:'Organization',val:info.org||'—'},
    {label:'Timezone',val:info.timezone||'—'},
    {label:'Coordinates',val:info.loc||'—'},
  ]:[]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex gap-2">
          <input value={ip} onChange={e=>setIp(e.target.value)} placeholder="Leave blank for your own IP"
            className="flex-1 rounded border border-gray-300 px-3 py-2" onKeyDown={e=>e.key==='Enter'&&lookup(ip||undefined)}/>
          <button onClick={()=>lookup(ip||undefined)} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading?'...':'Lookup'}
          </button>
        </div>
        <button onClick={()=>lookup()} className="w-full border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
          Look up my IP address
        </button>
        {err&&<p className="text-red-500 text-sm">{err}</p>}
        {info&&(
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {rows.map(r=>(
              <div key={r.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-600">{r.label}</span>
                <span className="text-sm font-mono text-gray-900">{r.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}