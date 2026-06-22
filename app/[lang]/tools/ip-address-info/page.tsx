'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('ip-address-info')!

function parseIPv4(ip: string) {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p=>isNaN(p)||p<0||p>255)) return null
  const n = parts.reduce((acc,p)=>(acc*256+p),0)
  const bin = parts.map(p=>p.toString(2).padStart(8,'0')).join('.')
  const hex = parts.map(p=>p.toString(16).padStart(2,'0').toUpperCase()).join(':')
  
  let cls=''; let type='Public'
  if (parts[0] < 128) cls='A'
  else if (parts[0] < 192) cls='B'
  else if (parts[0] < 224) cls='C'
  else if (parts[0] < 240) cls='D (Multicast)'
  else cls='E (Reserved)'
  
  if (parts[0]===10) type='Private (Class A)'
  else if (parts[0]===172&&parts[1]>=16&&parts[1]<=31) type='Private (Class B)'
  else if (parts[0]===192&&parts[1]===168) type='Private (Class C)'
  else if (parts[0]===127) type='Loopback'
  else if (parts[0]===169&&parts[1]===254) type='Link-local'
  else if (parts[0]===0) type='This network'
  else if (parts[0]===255) type='Broadcast'
  else if (parts[0]>=224&&parts[0]<=239) type='Multicast'

  return { parts, n, bin, hex, cls, type }
}

function ipWithMask(ip: string, cidr: number) {
  const parts = ip.split('.').map(Number)
  const mask = Array(4).fill(0).map((_,i)=>Math.max(0,Math.min(255,(cidr-i*8>=8?255:cidr-i*8<=0?0:256-(1<<(8-(cidr-i*8)))))))
  const network = parts.map((p,i)=>(p&mask[i]))
  const broadcast = parts.map((p,i)=>(p|((~mask[i])&255)))
  const hosts = Math.max(0,Math.pow(2,32-cidr)-2)
  return { mask:mask.join('.'), network:network.join('.'), broadcast:broadcast.join('.'), hosts }
}

export default function IpAddressInfoPage({ params }: { params: { lang: string } }) {
  const [ip, setIp] = useState('192.168.1.100')
  const [cidr, setCidr] = useState(24)
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('ip-address-info'); tracked.current = true } }

  const parsed = parseIPv4(ip.trim())
  const subnet = parsed && cidr>=0&&cidr<=32 ? ipWithMask(ip.trim(),cidr) : null

  async function copy(val:string,id:string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('ip-address-info')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const rows = parsed ? [
    { label:'Type', val:parsed.type },
    { label:'Class', val:parsed.cls },
    { label:'Binary', val:parsed.bin },
    { label:'Hexadecimal', val:parsed.hex },
    { label:'Decimal (long)', val:parsed.n.toString() },
    ...(subnet ? [
      { label:'Subnet mask', val:subnet.mask },
      { label:'Network address', val:subnet.network },
      { label:'Broadcast address', val:subnet.broadcast },
      { label:'Usable hosts', val:subnet.hosts.toLocaleString() },
    ] : []),
  ] : []

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">IPv4 Address</label>
            <input value={ip} onChange={e=>{setIp(e.target.value);track()}} placeholder="192.168.1.1"
              className={'w-44 px-3 py-2 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 ' + (ip&&!parsed?'border-red-300':'border-gray-200')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CIDR prefix</label>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <input type="number" value={cidr} min={0} max={32} onChange={e=>{setCidr(parseInt(e.target.value));track()}}
                className="w-16 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          {ip && !parsed && <p className="text-xs text-red-500 self-center">Invalid IPv4 address</p>}
        </div>
        {rows.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {rows.map((row,i)=>(
              <div key={row.label} onClick={()=>copy(row.val,row.label)}
                className={'flex gap-0 cursor-pointer hover:bg-brand-50 transition-colors ' + (i%2===0?'bg-white':'bg-gray-50')}>
                <div className="px-4 py-2.5 text-xs text-gray-500 w-40 shrink-0 border-r border-gray-200">{row.label}</div>
                <div className="px-4 py-2.5 text-sm font-mono text-gray-800 flex-1 flex items-center justify-between">
                  <span>{row.val}</span>
                  {copied===row.label && <span className="text-xs text-brand-400">\u2713</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
