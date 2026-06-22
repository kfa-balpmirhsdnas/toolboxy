'use client'
import { useState, useEffect } from 'react'

interface IpData {
  ip: string
  city?: string
  region?: string
  country?: string
  country_name?: string
  org?: string
  timezone?: string
  postal?: string
  latitude?: number
  longitude?: number
}

function parseIp(ip: string): { valid: boolean; version: 4|6|null; parts?: number[] } {
  const v4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)
  if(v4) {
    const parts = ip.split('.').map(Number)
    const valid = parts.every(p=>p>=0&&p<=255)
    return { valid, version: 4, parts }
  }
  const v6 = /^[0-9a-fA-F:]{2,39}$/.test(ip)
  if(v6) return { valid: true, version: 6 }
  return { valid: false, version: null }
}

function isPrivate(ip: string): string|null {
  const p = ip.split('.').map(Number)
  if(p[0]===10) return 'Private (Class A)'
  if(p[0]===172&&p[1]>=16&&p[1]<=31) return 'Private (Class B)'
  if(p[0]===192&&p[1]===168) return 'Private (Class C)'
  if(p[0]===127) return 'Loopback'
  if(p[0]===169&&p[1]===254) return 'Link-local'
  return null
}

export default function IpAddressInfo() {
  const [myIp,setMyIp]=useState<IpData|null>(null)
  const [lookupIp,setLookupIp]=useState('')
  const [lookupData,setLookupData]=useState<IpData|null>(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    fetch('https://ipapi.co/json/').then(r=>r.json()).then(d=>setMyIp(d)).catch(()=>{})
  },[])

  const lookup = async () => {
    if(!lookupIp.trim()) return
    const parsed = parseIp(lookupIp.trim())
    if(!parsed.valid) { setError('Invalid IP address format'); return }
    setLoading(true); setError(''); setLookupData(null)
    try {
      const r = await fetch(`https://ipapi.co/${lookupIp.trim()}/json/`)
      const d = await r.json()
      if(d.error) throw new Error(d.reason||'Lookup failed')
      setLookupData(d)
    } catch(e:unknown) {
      setError((e as Error).message||'Lookup failed')
    } finally { setLoading(false) }
  }

  const IpCard = ({data,title}:{data:IpData,title:string}) => {
    const parsed=parseIp(data.ip)
    const priv=parsed.version===4?isPrivate(data.ip):null
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">{title}</h3>
        <div className="text-3xl font-black font-mono text-gray-900 mb-4 break-all">{data.ip}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Version',`IPv${parsed.version||'?'}`],
            ['Type',priv||'Public'],
            ['Country',data.country_name||data.country||'–'],
            ['Region',data.region||'–'],
            ['City',data.city||'–'],
            ['Postal',data.postal||'–'],
            ['Timezone',data.timezone||'–'],
            ['Organization',data.org||'–'],
            data.latitude!=null?['Coordinates',`${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)}`]:['Coordinates','–'],
          ].map(([label,value])=>(
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IP Address Info</h1>
        <p className="text-gray-500 mb-8">Look up geolocation, organization, and network details for any IP address.</p>
        {myIp&&<IpCard data={myIp} title="Your IP Address"/>}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 my-6">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Look Up Any IP</h3>
          <div className="flex gap-3">
            <input type="text" value={lookupIp} onChange={e=>setLookupIp(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&lookup()}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 8.8.8.8"/>
            <button onClick={lookup} disabled={loading||!lookupIp.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading?'...':'Look Up'}
            </button>
          </div>
          {error&&<p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
        {lookupData&&<IpCard data={lookupData} title={`Results for ${lookupData.ip}`}/>}
      </div>
    </div>
  )
}