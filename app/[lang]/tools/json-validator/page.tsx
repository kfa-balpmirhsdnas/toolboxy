'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('json-validator')!

export default function JsonValidatorPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ valid: boolean; error?: string; formatted?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function validate() {
    if (!input.trim()) return
    if (!tracked.current) { trackToolUsed('json-validator'); tracked.current = true }
    try {
      const parsed = JSON.parse(input)
      setResult({ valid: true, formatted: JSON.stringify(parsed, null, 2) })
    } catch (e: unknown) {
      setResult({ valid: false, error: (e as Error).message })
    }
  }

  async function copy() {
    if (!result?.formatted) return
    await navigator.clipboard.writeText(result.formatted)
    trackToolCopy('json-validator')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">JSON Input</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null) }}
            placeholder={'{\"name\": \"ToolBoxy\", \"version\": 1}'}
            className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          onClick={validate}
          disabled={!input.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Validate JSON
        </button>
        {result && (
          <div className={`rounded-xl p-4 border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{result.valid ? '✅' : '❌'}</span>
                <span className={`font-semibold text-sm ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                  {result.valid ? 'Valid JSON' : 'Invalid JSON'}
                </span>
              </div>
              {result.formatted && (
                <button onClick={copy} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            {result.error && <p className="text-sm text-red-600 font-mono mt-1">{result.error}</p>}
            {result.formatted && (
              <pre className="text-xs text-green-800 font-mono overflow-auto max-h-64 mt-2 bg-green-50 rounded p-2">{result.formatted}</pre>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400">Validates JSON syntax and pretty-prints valid JSON · Updates on button click</p>
      </div>
    </ToolLayout>
  )
}
