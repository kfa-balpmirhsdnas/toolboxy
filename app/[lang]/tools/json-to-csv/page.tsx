'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('json-to-csv')!

function jsonToCsv(jsonStr: string): { csv: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr)
    const arr = Array.isArray(data) ? data : [data]
    if (arr.length === 0) return { csv: '', error: 'Empty array' }
    const keys = Object.keys(arr[0])
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s
    }
    const header = keys.join(',')
    const rows = arr.map(row => keys.map(k => escape((row as Record<string, unknown>)[k])).join(','))
    return { csv: [header, ...rows].join('\n') }
  } catch (e: unknown) {
    return { csv: '', error: (e as Error).message }
  }
}

export default function JsonToCsvPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ csv: string; error?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function convert() {
    if (!input.trim()) return
    if (!tracked.current) { trackToolUsed('json-to-csv'); tracked.current = true }
    setResult(jsonToCsv(input))
  }

  async function copy() {
    if (!result?.csv) return
    await navigator.clipboard.writeText(result.csv)
    trackToolCopy('json-to-csv')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    if (!result?.csv) return
    trackToolDownload('json-to-csv', 'csv')
    const blob = new Blob([result.csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'output.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const placeholder = JSON.stringify([{ name: 'Alice', age: 30, city: 'Seoul' }, { name: 'Bob', age: 25, city: 'Tokyo' }], null, 2)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">JSON Input (array of objects)</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null) }}
            placeholder={placeholder}
            className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          onClick={convert}
          disabled={!input.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Convert to CSV
        </button>
        {result?.error && (
          <div className="rounded-xl p-4 bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 font-mono">❌ {result.error}</p>
          </div>
        )}
        {result?.csv && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">CSV OUTPUT</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={result.csv}
                readOnly
                className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-600 bg-gray-50 focus:outline-none"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={copy} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={download} className="text-xs bg-brand-600 text-white border border-brand-600 px-2 py-1 rounded-lg hover:bg-brand-700">
                  Download
                </button>
              </div>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Converts JSON array of objects to CSV · Handles commas and quotes automatically</p>
      </div>
    </ToolLayout>
  )
}
