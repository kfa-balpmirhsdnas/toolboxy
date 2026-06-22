'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('json-beautifier')!

type JsonVal = string | number | boolean | null | JsonVal[] | { [k: string]: JsonVal }

function beautify(input: string, indent: number): { output: string; error?: string } {
  try {
    const parsed = JSON.parse(input)
    return { output: JSON.stringify(parsed, null, indent) }
  } catch(e: unknown) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

function colorize(json: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  const regex = /("(\\[\s\S]|[^"\\])*")(?:\s*:)?|true|false|null|(-?\d+(\.\d+)?([eE][+-]?\d+)?)/g
  let last = 0
  let i = 0

  json.replace(regex, (match, ...args) => {
    const offset = args[args.length-2] as number
    if (offset > last) parts.push(<span key={'t'+i++}>{json.slice(last,offset)}</span>)
    const isKey = json[offset+match.length] === ':'||json.slice(offset+match.length).trimStart()[0]===':'
    const isStr = match.startsWith('"')
    const cls = isStr&&isKey?'text-blue-400':isStr?'text-green-400':match==='true'||match==='false'?'text-yellow-400':match==='null'?'text-red-400':'text-purple-300'
    parts.push(<span key={'m'+i++} className={cls}>{match}</span>)
    last = offset+match.length
    return match
  })
  if (last < json.length) parts.push(<span key={'end'}>{json.slice(last)}</span>)
  return parts
}

export default function JsonBeautifierPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('{"name":"Alice","age":30,"hobbies":["reading","coding"],"address":{"city":"Seoul","country":"KR"}}')
  const [indent, setIndent] = useState(2)
  const [highlight, setHighlight] = useState(true)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('json-beautifier'); tracked.current = true } }

  const { output, error } = beautify(input, indent)
  const bytesBefore = new Blob([input]).size
  const bytesAfter = output ? new Blob([output]).size : 0

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('json-beautifier')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }
  function download() {
    const blob=new Blob([output],{type:'application/json'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a')
    a.href=url;a.download='data.json';a.click();URL.revokeObjectURL(url)
    trackToolDownload('json-beautifier','json')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs font-medium text-gray-600">Indent:</span>
          {[2,4,8].map(n=>(
            <button key={n} onClick={()=>setIndent(n)}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (indent===n?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {n} spaces
            </button>
          ))}
          <label className="flex items-center gap-2 cursor-pointer text-sm ml-2">
            <input type="checkbox" checked={highlight} onChange={e=>setHighlight(e.target.checked)} className="accent-brand-600" />
            Syntax highlight
          </label>
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={4} placeholder="Paste JSON..."
          className={'w-full px-4 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (error?'border-red-300':'border-gray-200')} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">{bytesBefore}B \u2192 {bytesAfter}B</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
                <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
              </div>
            </div>
            <pre className="p-4 bg-gray-900 text-gray-300 text-xs rounded-xl font-mono overflow-auto max-h-80">
              {highlight ? colorize(output) : output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
