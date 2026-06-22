'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('json-minifier')!

export default function JsonMinifierPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function process(raw: string) {
    setInput(raw)
    if (!raw.trim()) { setOutput(''); setError(''); return }
    if (!tracked.current) { trackToolUsed('json-minifier'); tracked.current = true }
    try {
      const parsed = JSON.parse(raw)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('json-minifier')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'minified.json'; a.click()
    URL.revokeObjectURL(url)
    trackToolDownload('json-minifier', 'json')
  }

  const savings = input && output ? Math.round((1 - output.length / input.length) * 100) : 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">JSON Input</label>
          <textarea
            value={input}
            onChange={e => process(e.target.value)}
            placeholder={'\{\n  "key": "value",\n  "array": [1, 2, 3]\n}'}
            rows={8}
            className={'w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (error ? 'border-red-300' : 'border-gray-200')}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        {output && (
          <>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
              <span className="text-green-700 font-medium">\u2713 Minified</span>
              <span className="text-green-600">{input.length} \u2192 {output.length} bytes</span>
              <span className="ml-auto font-bold text-green-700">{savings}% smaller</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Minified Output</label>
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? '\u2713 Copied' : 'Copy'}</button>
                  <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-800 break-all max-h-40 overflow-y-auto">
                {output}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
