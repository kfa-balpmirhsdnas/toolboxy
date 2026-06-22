'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('subnet-calculator')!
function ipToNum(ip:string):number{return ip.split('.').reduce((acc,o)=>(acc<<8)+parseInt(o),0)>>>0}
function numToIp(n:number):string{return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.')}
function cidrToMask(cidr:number):number{return cidr===0?0:((0xFFFFFFFF<<(32-cidr))>>>0)}
export default function SubnetCalculatorPage() {
  const [ip,setIp]=useState('192.168.1.100')
  const [cidr,setCidr]=useState(24)
  const [err,setErr]=useState('')
  let info:{label:string;val:string}[]=[]
  try{
    const parts=ip.split('.')
    if(parts.length!==4||parts.some(p=>isNaN(Number(p))||Number(p)<0||Number(p)>255))throw new Error('Invalid IP')
    const ipNum=ipToNum(ip)
    const mask=cidrToMask(cidr)
    const network=(ipNum&mask)>>>0
    const broadcast=(network|(~mask>>>0))>>>0
    const first=(network+1)>>>0
    const last=(broadcast-1)>>>0
    const count=cidr>=31?Math.pow(2,32-cidr):Math.pow(2,32-cidr)-2
    info=[
      {label:'IP Address',val:ip},
      {label:'Subnet Mask',val:numToIp(mask)},
      {label:'Network Address',val:numToIp(network)+'/'+cidr},
      {label:'Broadcast Address',val:numToIp(broadcast)},
      {label:'First Host',val:cidr<31?numToIp(first):'N/A'},
      {label:'Last Host',val:cidr<31?numToIp(last):'N/A'},
      {label:'Usable Hosts',val:count.toLocaleString()},
      {label:'IP Class',val:ipNum>>>24<128?'A':ipNum>>>24<192?'B':'C'},
      {label:'IP Type',val:(network===ipToNum('10.0.0.0')&&mask>=ipToNum('255.0.0.0'))||(network===ipToNum('172.16.0.0')&&cidr>=12&&cidr<=16)||(network===ipToNum('192.168.0.0')&&cidr>=16)?'Private':'Public'},
    ]
    setErr('')
  }catch(e){setErr((e as Error).message)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
            <input value={ip} onChange={e=>setIp(e.target.value)} placeholder="192.168.1.100" className="w-full rounded border border-gray-300 px-3 py-2 font-mono"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">CIDR /{cidr}</label>
            <input type="range" min="1" max="32" value={cidr} onChange={e=>setCidr(Number(e.target.value))} className="w-full mt-3"/></div>
        </div>
        <div className="flex flex-wrap gap-1.5">{[8,16,24,25,26,27,28,29,30].map(c=>(
          <button key={c} onClick={()=>setCidr(c)} className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition ${cidr===c?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>/{c}</button>
        ))}</div>
        {err&&<p className="text-red-500 text-sm">{err}</p>}
        {info.length>0&&<div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          {info.map(r=>(
            <div key={r.label} className="flex justify-between items-center px-4 py-2.5">
              <span className="text-sm text-gray-600">{r.label}</span>
              <span className="font-mono text-sm font-semibold text-gray-900">{r.val}</span>
            </div>
          ))}
        </div>}
      </div>
    </ToolLayout>
  )
}