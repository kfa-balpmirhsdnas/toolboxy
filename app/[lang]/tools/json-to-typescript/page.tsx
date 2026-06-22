'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('json-to-typescript')!

type JsonVal = string | number | boolean | null | JsonVal[] | { [k: string]: JsonVal }

function jsonToTs(data: JsonVal, name = 'Root', indent = 0): string {
  const pad = '  '.repeat(indent)
  const ipad = '  '.repeat(indent+1)
  
  if (data === null) return 'null'
  if (Array.isArray(data)) {
    if (!data.length) return 'unknown[]'
    const types = Array.from(new Set(data.map(item=>jsonToTs(item, name+'Item', indent)))).join(' | ')
    return '(' + types + ')[]'
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (!entries.length) return 'Record<string, unknown>'
    const fields = entries.map(([k,v]) => {
      const optional = v === null ? '?' : ''
      const childName = k.charAt(0).toUpperCase()+k.slice(1)
      return ipad + k + optional + ': ' + jsonToTs(v, childName, indent+1)
    })
    return '{\n' + fields.join('\n') + '\n' + pad + '}'
  }
  if (typeof data === 'string') return 'string'
  if (typeof data === 'number') return Number.isInteger(data) ? 'number' : 'number'
  if (typeof data === 'boolean') return 'boolean'
  return 'unknown'
}

function generateInterfaces(data: JsonVal, name = 'Root'): string {
  const lines: string[] = []
  
  function process(d: JsonVal, n: string) {
    if (d === null || typeof d !== 'object') return
    if (Array.isArray(d)) {
      if (d.length > 0 && typeof d[0] === 'object' && d[0] !== null) process(d[0], n+'Item')
      return
    }
    const entries = Object.entries(d as Record<string,JsonVal>)
    const fields = entries.map(([k,v]) => {
      const opt = v===null?'?':''
      const childName = n+k.charAt(0).toUpperCase()+k.slice(1)
      let type: string
      if (v===null) type='null'
      else if (Array.isArray(v)) { type=(v.length>0&&typeof v[0]==='object')?childName+'Item[]':'unknown[]' }
      else if (typeof v==='object') type=childName
      else type=typeof v
      return '  '+k+opt+': '+type+';'
    })
    lines.push('export interface '+n+' {')
    lines.push(...fields)
    lines.push('}')
    lines.push('')
    entries.forEach(([k,v])=>{
      const childName=n+k.charAt(0).toUpperCase()+k.slice(1)
      process(v,childName)
    })
  }
  
  process(data, name)
  return lines.join('\n')
}

const SAMPLE = JSON.stringify({
  user: { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
  posts: [{ id: 1, title: 'Hello World', tags: ['typescript','json'] }],
  meta: { total: 42, page: 1 }
}, null, 2)

export default function JsonToTypescriptPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState(SAMPLE)
  const [rootName, setRootName] = useState('Root')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('json-to-typescript'); tracked.current = true } }

  let output = ''
  try {
    const parsed = JSON.parse(input)
    setError('')
    output = generateInterfaces(parsed, rootName)
  } catch(e: unknown) {
    if (input) setError(e instanceof Error ? e.message : 'Invalid JSON')
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('json-to-typescript')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }
  function download() {
    const blob = new Blob([output],{type:'text/plain'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=url; a.download='types.ts'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('json-to-typescript','ts')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Root interface name</label>
            <input value={rootName} onChange={e=>{setRootName(e.target.value||'Root');track()}}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">JSON Input</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={8}
            className={'w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (error?'border-red-300':'border-gray-200')} />
          {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">TypeScript interfaces</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
                <button onClick={download} className="text-xs text-brand-600 hover:underline">Download .ts</button>
              </div>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-64">{output}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
