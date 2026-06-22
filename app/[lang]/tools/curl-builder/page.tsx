'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('curl-builder')!

export default function CurlBuilderPage() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://api.example.com/data')
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }])
  const [bodyText, setBodyText] = useState('')
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }])
  const [copied, setCopied] = useState(false)

  function addHeader() { setHeaders(h => [...h, { key: '', value: '' }]) }
  function removeHeader(i: number) { setHeaders(h => h.filter((_, idx) => idx !== i)) }
  function updateHeader(i: number, field: 'key' | 'value', v: string) {
    setHeaders(h => h.map((item, idx) => idx === i ? { ...item, [field]: v } : item))
  }
  function addParam() { setQueryParams(p => [...p, { key: '', value: '' }]) }
  function removeParam(i: number) { setQueryParams(p => p.filter((_, idx) => idx !== i)) }
  function updateParam(i: number, field: 'key' | 'value', v: string) {
    setQueryParams(p => p.map((item, idx) => idx === i ? { ...item, [field]: v } : item))
  }

  function buildCurl(): string {
    let fullUrl = url
    const validParams = queryParams.filter(p => p.key.trim())
    if (validParams.length > 0) {
      const qs = validParams.map(p => encodeURIComponent(p.key) + '=' + encodeURIComponent(p.value)).join('&')
      fullUrl += (url.includes('?') ? '&' : '?') + qs
    }
    let cmd = 'curl -X ' + method + ' "' + fullUrl + '"'
    for (const h of headers) {
      if (h.key.trim()) cmd += ' \\ \n  -H "' + h.key + ': ' + h.value + '"'
    }
    if (bodyText.trim() && method !== 'GET' && method !== 'HEAD') {
      cmd += ' \\ \n  -d \'' + bodyText.replace(/\'/g, "'\\''"  ) + '\''
    }
    return cmd
  }

  async function copy() {
    await navigator.clipboard.writeText(buildCurl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">cURL Builder</h1>
      <p className="text-gray-500 mb-8">Build cURL commands visually</p>

      <div className="space-y-6">
        <div className="flex gap-3">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="border rounded px-3 py-2 font-mono bg-white">
            {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)}
            className="flex-1 border rounded px-3 py-2 font-mono"
            placeholder="https://api.example.com/endpoint" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Query Params</span>
            <button onClick={addParam} className="text-sm text-blue-600 hover:underline">+ Add</button>
          </div>
          {queryParams.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={p.key} onChange={e => updateParam(i, 'key', e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="key" />
              <input value={p.value} onChange={e => updateParam(i, 'value', e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="value" />
              <button onClick={() => removeParam(i)} className="text-red-400 px-2">x</button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Headers</span>
            <button onClick={addHeader} className="text-sm text-blue-600 hover:underline">+ Add</button>
          </div>
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Header-Name" />
              <input value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="value" />
              <button onClick={() => removeHeader(i)} className="text-red-400 px-2">x</button>
            </div>
          ))}
        </div>

        {method !== 'GET' && method !== 'HEAD' && (
          <div>
            <label className="font-semibold block mb-2">Request Body</label>
            <textarea value={bodyText} onChange={e => setBodyText(e.target.value)}
              className="w-full border rounded px-3 py-2 font-mono text-sm h-32"
              placeholder='{"key": "value"}' />
          </div>
        )}

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Generated Command</span>
            <button onClick={copy}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-900 text-green-300 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
            {buildCurl()}
          </pre>
        </div>
      </div>
    </div>
  )
}