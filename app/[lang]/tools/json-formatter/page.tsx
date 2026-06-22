'use client'
import { useState } from 'react'

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  function format() {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch(e:any) { setError(e.message); setOutput('') }
  }

  function minify() {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch(e:any) { setError(e.message); setOutput('') }
  }

  function validate() {
    try { JSON.parse(input); setError('\u2713 Valid JSON'); setOutput('') }
    catch(e:any) { setError(e.message); setOutput('') }
  }

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JSON Formatter</h1>
        <p className="text-gray-500 mb-8">Format, validate and minify JSON data instantly</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input JSON</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
              placeholder='{"key": "value", "array": [1, 2, 3]}'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Indent:</span>
              {[2,4].map(n=>(
                <button key={n} onClick={()=>setIndent(n)}
                  className={'px-2.5 py-1 rounded text-sm transition-colors '+(indent===n?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                  {n} spaces
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={format} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors">Format</button>
              <button onClick={minify} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">Minify</button>
              <button onClick={validate} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Validate</button>
            </div>
          </div>
          {error&&(
            <p className={'text-sm px-3 py-2 rounded-lg '+(error.startsWith('\u2713')?'text-green-700 bg-green-50':'text-red-600 bg-red-50')}>
              {error}
            </p>
          )}
          {output&&(
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Output</label>
                <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
              </div>
              <textarea value={output} readOnly rows={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm bg-gray-50 resize-none" />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}