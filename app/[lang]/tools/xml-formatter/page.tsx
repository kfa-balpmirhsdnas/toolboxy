'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('xml-formatter')!

function formatXml(xml: string, indent: number): string {
  const tab = ' '.repeat(indent)
  let result = ''
  let level = 0
  const tokens = xml.match(/<[^>]+>|[^<]+/g) || []
  
  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue
    
    if (trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
      result += tab.repeat(level) + trimmed + '\n'
    } else if (trimmed.startsWith('</')) {
      level = Math.max(0, level-1)
      result += tab.repeat(level) + trimmed + '\n'
    } else if (trimmed.endsWith('/>')) {
      result += tab.repeat(level) + trimmed + '\n'
    } else if (trimmed.startsWith('<')) {
      result += tab.repeat(level) + trimmed + '\n'
      level++
    } else {
      result += tab.repeat(level) + trimmed + '\n'
    }
  }
  return result.trim()
}

function minifyXml(xml: string): string {
  return xml.replace(/\s+/g,' ').replace(/> </g,'><').replace(/> /g,'>').replace(/ </g,'<').trim()
}

export default function XmlFormatterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?><root><person id="1"><name>Alice</name><age>30</age></person><person id="2"><name>Bob</name><age>25</age></person></root>')
  const [indent, setIndent] = useState(2)
  const [mode, setMode] = useState<'format'|'minify'>('format')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('xml-formatter'); tracked.current = true } }

  const output = (() => {
    if (!input.trim()) return ''
    try {
      setError('')
      return mode === 'format' ? formatXml(input, indent) : minifyXml(input)
    } catch(e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      return ''
    }
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('xml-formatter')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }
  function download() {
    const blob = new Blob([output],{type:'text/xml'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a'); a.href=url; a.download='formatted.xml'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('xml-formatter','xml')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          {(['format','minify'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m}
            </button>
          ))}
          {mode==='format' && [2,4].map(n=>(
            <button key={n} onClick={()=>setIndent(n)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (indent===n?'bg-gray-700 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {n} spaces
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">XML Input</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output ({output.length} bytes)</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
                <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
              </div>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-64">{output}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
