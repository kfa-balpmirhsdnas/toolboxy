'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('json-formatter')!

export default function JsonFormatterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  function format() {
    try { setOutput(JSON.stringify(JSON.parse(input), null, indent)); setError('') }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Invalid JSON'); setOutput('') }
  }

  function minify() {
    try { setOutput(JSON.stringify(JSON.parse(input))); setError('') }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Invalid JSON'); setOutput('') }
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Input JSON</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"key": "value"}'
            className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
          <div className="relative">
            <textarea value={output} readOnly placeholder="Formatted JSON will appear here…"
              className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 bg-gray-50 focus:outline-none" />
            {output && <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ Copied' : 'Copy'}</button>}
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">⚠ {error}</p>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Indent:</label>
          {[2, 4].map((n) => (
            <button key={n} onClick={() => setIndent(n)} className={`text-sm px-3 py-1 rounded-lg border transition-colors ${indent === n ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'}`}>{n} spaces</button>
          ))}
        </div>
        <button onClick={format} disabled={!input.trim()} className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40">Format</button>
        <button onClick={minify} disabled={!input.trim()} className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40">Minify</button>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="text-sm text-gray-400 hover:text-red-500 transition-colors ml-auto">Clear</button>
      </div>
    </ToolLayout>
  )
}