'use client'
import { useState } from 'react'

const encodeMap: Record<string,string> = {
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
  '\u00A9':'&copy;', '\u00AE':'&reg;', '\u2122':'&trade;', '\u20AC':'&euro;',
  '\u00A3':'&pound;', '\u00A5':'&yen;', '\u00B0':'&deg;', '\u00B1':'&plusmn;',
  '\u00D7':'&times;', '\u00F7':'&divide;', '\u2013':'&ndash;', '\u2014':'&mdash;',
  '\u00A0':'&nbsp;', '\u00AB':'&laquo;', '\u00BB':'&raquo;',
}
const decodeMap: Record<string,string> = Object.fromEntries(Object.entries(encodeMap).map(([k,v])=>[v,k]))
const ENC_RE = /[&<>"'\u00A9\u00AE\u2122\u20AC\u00A3\u00A5\u00B0\u00B1\u00D7\u00F7\u2013\u2014\u00A0\u00AB\u00BB]/g
const PREVIEW_ENTRIES = Object.entries(encodeMap).slice(0,12)

export default function HtmlEntityEncoderPage() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode'|'decode'>('encode')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  function process() {
    if (!input) return
    if (mode === 'encode') {
      setOutput(input.replace(ENC_RE, c => encodeMap[c] ?? c))
    } else {
      setOutput(input
        .replace(/&[a-zA-Z]+;/g, e => decodeMap[e] ?? e)
        .replace(/&#(\d+);/g, (_,n) => String.fromCharCode(parseInt(n)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_,h) => String.fromCharCode(parseInt(h,16)))
      )
    }
  }

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML Entity Encoder</h1>
        <p className="text-gray-500 mb-6">Encode special characters to HTML entities and decode them back</p>
        <div className="flex gap-2 mb-6">
          {(['encode','decode'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setOutput('')}}
              className={'px-4 py-2 rounded-lg font-medium capitalize transition-colors '+(mode===m?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50')}>
              {m}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode==='encode' ? 'Plain Text Input' : 'HTML with Entities'}
            </label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
              placeholder={mode==='encode' ? 'Enter text with <tags> & "special" chars...' : 'Enter &lt;HTML&gt; &amp; entities...'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <button onClick={process} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {mode==='encode' ? 'Encode to HTML Entities' : 'Decode HTML Entities'}
          </button>
          {output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Result</label>
                <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
              </div>
              <textarea value={output} readOnly rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm bg-gray-50 resize-none" />
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Common HTML Entities Reference</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {PREVIEW_ENTRIES.map(([char, entity]) => (
              <div key={entity} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5">
                <span className="font-mono text-brand-600 text-xs">{entity}</span>
                <span className="text-gray-400">\u2192</span>
                <span>{char==='\u00A0'?'NBSP':char}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}