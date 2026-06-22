'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('html-entity-encoder')!

function encodeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}

function decodeHtml(s: string): string {
  const el = typeof document !== 'undefined' ? document.createElement('div') : null
  if (!el) return s
  el.innerHTML = s
  return el.textContent || el.innerText || s
}

function encodeAllHtml(s: string): string {
  return Array.from(s).map(c => {
    const code = c.codePointAt(0) || 0
    if (code > 127 || /[&<>"'/]/.test(c)) return '&#' + code + ';'
    return c
  }).join('')
}

export default function HtmlEntityEncoderPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode'|'decode'|'encode-all'>('encode')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function handleInput(v: string) {
    if (!tracked.current) { trackToolUsed('html-entity-encoder'); tracked.current = true }
    setInput(v)
  }

  const output = (() => {
    if (!input) return ''
    if (mode === 'encode') return encodeHtml(input)
    if (mode === 'encode-all') return encodeAllHtml(input)
    return decodeHtml(input)
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('html-entity-encoder')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {([['encode', 'Encode (safe chars)'], ['encode-all', 'Encode (all chars)'], ['decode', 'Decode']] as const).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
          <textarea
            value={input}
            onChange={e => handleInput(e.target.value)}
            rows={6}
            placeholder={mode === 'decode' ? '&lt;p&gt;Hello &amp; World&lt;/p&gt;' : '<p>Hello & "World"</p>'}
            className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {output && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">OUTPUT</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                rows={6}
                className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono bg-gray-50 text-gray-700 focus:outline-none"
              />
              <button onClick={copy}
                className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Input: {input.length} chars</span>
              <span>Output: {output.length} chars</span>
            </div>
          </>
        )}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
          <p className="font-medium text-gray-600 mb-1">Common entities:</p>
          <div className="grid grid-cols-3 gap-1 font-mono">
            {[['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&#39;'], ['©', '&copy;'], ['®', '&reg;'], ['→', '&rarr;'], ['×', '&times;']].map(([c, e]) => (
              <span key={c}>{c} = {e}</span>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
