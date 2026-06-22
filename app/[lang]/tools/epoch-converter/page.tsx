'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('epoch-converter')!

const ZONES = ['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Seoul','Asia/Shanghai','Australia/Sydney']

export default function EpochConverterPage({ params }: { params: { lang: string } }) {
  const [epoch, setEpoch] = useState(() => String(Math.floor(Date.now()/1000)))
  const [unit, setUnit] = useState<'s'|'ms'>('s')
  const [zone, setZone] = useState('UTC')
  const [humanInput, setHumanInput] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('epoch-converter'); tracked.current = true } }

  const epochNum = parseInt(epoch)
  const ms = unit==='ms' ? epochNum : epochNum*1000
  const date = !isNaN(ms) ? new Date(ms) : null

  function fmtDate(d: Date, tz: string) {
    try { return d.toLocaleString('en-US',{timeZone:tz,hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}) } catch { return 'Invalid' }
  }
  function fmtIso(d: Date) { return d.toISOString() }
  function fmtRelative(d: Date) {
    const diff = (Date.now()-d.getTime())/1000
    if (Math.abs(diff)<60) return 'just now'
    const abs=Math.abs(diff)
    const [v,u]=abs<3600?[Math.round(abs/60),'min']:abs<86400?[Math.round(abs/3600),'hr']:abs<2592000?[Math.round(abs/86400),'day']:abs<31536000?[Math.round(abs/2592000),'month']:[Math.round(abs/31536000),'year']
    return (diff>0?v+' '+u+(v>1?'s':'')+' ago':'in '+v+' '+u+(v>1?'s':''))
  }

  function useNow() { const n=Date.now(); setEpoch(unit==='ms'?String(n):String(Math.floor(n/1000))); track() }
  
  function fromHuman() {
    if (!humanInput) return
    try {
      const d = new Date(humanInput)
      if (!isNaN(d.getTime())) { setEpoch(unit==='ms'?String(d.getTime()):String(Math.floor(d.getTime()/1000))); track() }
    } catch {}
  }

  async function copy(val:string,id:string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('epoch-converter')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const rows = date ? [
    { label:'ISO 8601', val:fmtIso(date) },
    { label:'Relative', val:fmtRelative(date) },
    { label:'Epoch (s)', val:String(Math.floor(ms/1000)) },
    { label:'Epoch (ms)', val:String(ms) },
    ...ZONES.slice(0,4).map(z=>({ label:z, val:fmtDate(date,z) })),
  ] : []

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Epoch timestamp</label>
            <input value={epoch} onChange={e=>{setEpoch(e.target.value);track()}}
              className="w-48 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="flex gap-1">
            {(['s','ms'] as const).map(u=>(
              <button key={u} onClick={()=>{setUnit(u);track()}}
                className={'px-3 py-2 rounded-xl text-sm font-medium transition-colors ' + (unit===u?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {u==='s'?'Seconds':'Milliseconds'}
              </button>
            ))}
          </div>
          <button onClick={useNow} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-colors">Now</button>
        </div>
        {date && (
          <div className="grid grid-cols-2 gap-2">
            {rows.map(row=>(
              <div key={row.label} onClick={()=>copy(row.val,row.label)} className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors">
                <p className="text-xs text-gray-500 mb-0.5">{row.label}</p>
                <p className="text-sm font-mono text-gray-800 truncate">{row.val}</p>
                <p className="text-xs text-brand-400 mt-0.5">{copied===row.label?'\u2713':''}</p>
              </div>
            ))}
          </div>
        )}
        <div className="pt-2 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-600 mb-1">Date \u2192 Epoch</label>
          <div className="flex gap-2">
            <input value={humanInput} onChange={e=>setHumanInput(e.target.value)} placeholder="e.g. 2024-01-01T00:00:00Z"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={fromHuman} className="px-4 py-2 bg-brand-600 text-white text-sm rounded-xl hover:bg-brand-700 transition-colors">Convert</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
