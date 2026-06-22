'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('text-case-converter')!

const CONVERSIONS = [
  { label: 'UPPERCASE',     fn: (s: string) => s.toUpperCase() },
  { label: 'lowercase',     fn: (s: string) => s.toLowerCase() },
  { label: 'Title Case',    fn: (s: string) => s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { label: 'Sentence case', fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
  { label: 'camelCase',     fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
  { label: 'PascalCase',    fn: (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, w => w.toUpperCase()).replace(/\s+/g, '') },
  { label: 'snake_case',    fn: (s: string) => s.toLowerCase().replace(/\s+/g, '_') },
  { label: 'kebab-case',    fn: (s: string) => s.toLowerCase().replace(/\s+/g, '-') },
  { label: 'CONSTANT_CASE', fn: (s: string) => s.toUpperCase().replace(/\s+/g, '_') },
]

export default function TextCaseConverterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text)
    setCopied(label); setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste your text here…"
            className="w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        {input.trim() ? (
          <div className="space-y-2">
            {CONVERSIONS.map(({ label, fn }) => {
              const result = fn(input)
              return (
                <div key={label} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-xs font-mono font-semibold text-gray-400 w-32 shrink-0">{label}</span>
                  <span className="flex-1 text-sm text-gray-800 font-mono break-all">{result}</span>
                  <button onClick={() => copy(result, label)} className="shrink-0 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors">
                    {copied === label ? '✓' : 'Copy'}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">Results appear here as you type</p>
        )}
      </div>
    </ToolLayout>
  )
}