'use client'

import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('uuid-generator')!

function genUUID(): string {
  const buf = new Uint8Array(16)
  crypto.getRandomValues(buf)
  buf[6] = (buf[6] & 0x0f) | 0x40
  buf[8] = (buf[8] & 0x3f) | 0x80
  const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

export default function UuidGeneratorPage({ params }: { params: { lang: string } }) {
  const [uuids, setUuids] = useState<string[]>(() => [genUUID()])
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const generate = useCallback(() => setUuids(Array.from({ length: count }, genUUID)), [count])

  async function copy(text: string) { await navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(null), 1500) }
  async function copyAll() { await copy(uuids.map(u => uppercase ? u.toUpperCase() : u).join('\n')); setCopied('__all__') }

  const display = (u: string) => uppercase ? u.toUpperCase() : u

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 shrink-0">Count</label>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
              {[1, 5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-4 h-4 accent-brand-600" /> Uppercase
          </label>
          <button onClick={generate} className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">Generate</button>
          {uuids.length > 1 && (
            <button onClick={copyAll} className="text-sm text-gray-500 hover:text-brand-600 transition-colors ml-auto">
              {copied === '__all__' ? '✓ Copied all' : 'Copy all'}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {uuids.map((u, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <code className="flex-1 text-sm font-mono text-gray-800">{display(u)}</code>
              <button onClick={() => copy(display(u))} className="shrink-0 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors">
                {copied === display(u) ? '✓' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">UUID v4 · Generated using <code>crypto.getRandomValues()</code></p>
      </div>
    </ToolLayout>
  )
}