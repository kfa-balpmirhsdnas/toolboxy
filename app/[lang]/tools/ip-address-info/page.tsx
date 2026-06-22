'use client'
import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('ip-address-info')!
function isValidIPv4(ip:string){return /^(d{1,3}.){3}d{1,3}$/.test(ip)&&ip.split('.').every(o=>parseInt(o)<=255)}
function isValidIPv6(ip:string){return /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip)}
function ipClass(ip:string){
  const first=parseInt(ip.split('.')[0])
  if(first<=127)return'A'
  if(first<=191)return'B'
  if(first<=223)return'C'
  if(first<=239)return'D (Multicast)'
  return'E (Reserved)'
}
function isPrivate(ip:string){
  const [a,b]=ip.split('.').map(Number)
  return a===10||a===127||(a===172&&b>=16&&b<=31)||(a===192&&b===168)
}
function toBinary(ip:string){return ip.split('.').map(o=>parseInt(o).toString(2).padStart(8,'0')).join('.')}
export default function IpAddressInfoPage() {
  const [input,setInput]=useState('')
  const [myIp,setMyIp]=useState('Loading...')
  useEffect(()=>{
    fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(d=>setMyIp(d.ip)).catch(()=>setMyIp('Unavailable'))
  },[])
  const ip=input||myIp
  const isV4=isValidIPv4(ip)
  const isV6=isValidIPv6(ip)
  const valid=isV4||isV6
  const infos=isV4?[
    ['Version','IPv4'],['Class',ipClass(ip)],['Type',isPrivate(ip)?'Private':'Public'],['Loopback',ip.startsWith('127.')?'Yes':'No'],['Broadcast',ip.endsWith('.255')?'Yes':'No'],['Binary',toBinary(ip)],
  ]:isV6?[['Version','IPv6'],['Type','IPv6 address']]:[]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
          <input value={input} onChange={e=>setInput(e.target.value)}
            className={'w-full rounded-xl border px-3 py-2.5 font-mono text-sm focus:outline-none '+(input&&!valid?'border-red-300 bg-red-50':'border-gray-300 focus:border-blue-400')}
            placeholder="Enter IP address or use your IP below"/>
          {input&&!valid&&<p className="text-red-500 text-xs mt-1">Invalid IP address</p>}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div><p className="text-xs text-blue-600 font-medium">Your current IP</p>
            <p className="font-mono font-bold text-blue-800 text-lg">{myIp}</p></div>
          <button onClick={()=>setInput(myIp)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Use this</button>
        </div>
        {valid&&infos.length>0&&(
          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            {infos.map(([k,v],i)=>(
              <div key={i} className={'flex items-start justify-between px-4 py-2.5 '+(i%2===0?'bg-white':'bg-gray-50')}>
                <span className="text-xs font-medium text-gray-500 w-24">{k}</span>
                <span className="font-mono text-sm text-gray-800 text-right break-all">{v}</span>
              </div>
            ))}
          </div>
        )}
        <div><p className="text-xs font-semibold text-gray-600 mb-2">Private IP ranges</p>
          <div className="space-y-1">
            {[['10.0.0.0 – 10.255.255.255','Class A'],['172.16.0.0 – 172.31.255.255','Class B'],['192.168.0.0 – 192.168.255.255','Class C'],['127.0.0.1','Loopback']].map(([r,c])=>(
              <div key={r} className="flex justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                <span className="font-mono text-gray-700">{r}</span><span className="text-gray-500">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}