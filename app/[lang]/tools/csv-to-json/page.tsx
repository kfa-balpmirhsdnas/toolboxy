'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('csv-to-json')!

function csvParse(text: string): object[] | string {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return '⚠ CSV must have a header row and at least one data row'
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
}

export default function CsvToJsonPage({ params }: { params: { lang: string } }) {
  const [csv, setCsv] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const result = csv.trim() ? csvParse(csv) : null
  const output = result ? (typeof result === 'string' ? result : JSON.stringify(result, null, 2)) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setCsv(ev.target?.result as string)
    reader.readAsText(f)
  }

  function downloadJson() {
    const blob = new Blob([output], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'output.json'
    a.click()
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-brand-400 transition-colors"
          >
            📂 Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onFile} className="hidden" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSV Input</label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={"name,age,city\nAlice,30,Seoul\nBob,25,Tokyo"}
            className="w-full h-36 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {output && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">JSON OUTPUT</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className={`w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono bg-gray-50 focus:outline-none ${output.startsWith('⚠') ? 'text-red-500' : 'text-gray-600'}`}
              />
              {!output.startsWith('⚠') && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={copy} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button onClick={downloadJson} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                    ↓ JSON
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Paste CSV or upload a .csv file · First row is treated as headers</p>
      </div>
    </ToolLayout>
  )
}
