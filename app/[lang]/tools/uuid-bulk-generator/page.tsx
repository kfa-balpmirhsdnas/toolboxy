'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('uuid-bulk-generator')!

function uuid4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8)
    return v.toString(16)
  })
}
function uuidNIL(): string { return '00000000-0000-0000-0000-000000000000' }
function uuidShort(): string { return Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,10) }

type Format = 'v4'|'nil'|'short'|'no-hyphens'|'uppercase'

function generate(format: Format): string {
  const raw = format==='nil' ? uuidNIL() : format==='short' ? uuidShort() : uuid4()
  if (format==='no-hyphens') return raw.replace(/-/g,'')
  if (format==='uppercase') return raw.toUpperCase()
  return raw
}

export default function UuidBulkGeneratorPage({ params }: { params: { lang: string } }) {
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<Format>('v4')
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('uuid-bulk-generator'); tracked.current = true } }

  function gen() {
    track()
    setUuids(Array.from({length:count},()=>generate(format)))
  }

  const text = uuids.join('\n')
  async function copy() { await navigator.clipboard.writeText(text); trackToolCopy('uuid-bulk-generator'); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  function download() {
    const blob = new Blob([text],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='uuids.txt'; a.click()
    trackToolDownload('uuid-bulk-generator','txt')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
            <input type="number" min={1} max={1000} value={count} onChange={e=>{setCount(Math.min(1000,Math.max(1,parseInt(e.target.value)||1)));track()}}
              className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
            <select value={format} onChange={e=>{setFormat(e.target.value as Format);track()}}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="v4">UUID v4</option>
              <option value="no-hyphens">No hyphens</option>
              <option value="uppercase">Uppercase</option>
              <option value="nil">Nil UUID</option>
              <option value="short">Short ID</option>
            </select>
          </div>
          <button onClick={gen} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Generate
          </button>
        </div>
        {uuids.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{uuids.length} UUIDs generated</span>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied':'Copy All'}</button>
                <button onClick={download} className="text-xs text-gray-500 hover:text-gray-700">Download .txt</button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono max-h-80 overflow-y-auto space-y-0.5">
              {uuids.map((u,i)=>(
                <div key={i} onClick={async()=>{await navigator.clipboard.writeText(u);trackToolCopy('uuid-bulk-generator')}}
                  className="cursor-pointer hover:bg-brand-50 rounded px-1 py-0.5 transition-colors">{u}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
