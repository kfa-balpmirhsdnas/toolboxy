'use client'
import {useState,useMemo} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
const RANGES=[
  {name:'Basic Latin',start:0x20,end:0x7E},
  {name:'Latin Extended',start:0xC0,end:0x24F},
  {name:'Greek',start:0x391,end:0x3C9},
  {name:'Arrows',start:0x2190,end:0x21FF},
  {name:'Math',start:0x2200,end:0x22FF},
]
export default function Page(){
  const [range,setRange]=useState(0)
  const [search,setSearch]=useState('')
  const [copied,setCopied]=useState('')
  const chars=useMemo(()=>{
    if(search){return Array.from({length:0x200},(_,i)=>String.fromCodePoint(i+0x20)).filter(c=>c.toLowerCase().includes(search.toLowerCase()))}
    const r=RANGES[range];return Array.from({length:r.end-r.start+1},(_,i)=>String.fromCodePoint(r.start+i))
  },[range,search])
  const copy=(c:string)=>{navigator.clipboard?.writeText(c);setCopied(c);setTimeout(()=>setCopied(''),1500)}
  const tool=TOOLS.find(t=>t.slug==='character-map')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"/>
          {!search&&<select value={range} onChange={e=>setRange(+e.target.value)} className="rounded border border-gray-300 px-2 py-2 text-sm">
            {RANGES.map((r,i)=><option key={i} value={i}>{r.name}</option>)}</select>}
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
          {chars.slice(0,192).map((c,i)=>(
            <button key={i} onClick={()=>copy(c)} title={'U+'+c.codePointAt(0)?.toString(16).toUpperCase().padStart(4,'0')}
              className={'p-2 text-lg border rounded hover:bg-blue-50 '+(copied===c?'bg-blue-100 border-blue-400':'border-gray-200')}>
              {c}
            </button>
          ))}
        </div>
        {copied&&<p className="text-sm text-center text-blue-600">Copied: {copied}</p>}
      </div>
    </ToolLayout>
  )
}