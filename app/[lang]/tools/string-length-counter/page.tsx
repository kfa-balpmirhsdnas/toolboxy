'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('string-length-counter')!

function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length
}

export default function StringLengthCounterPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('string-length-counter'); tracked.current = true }
  }

  const chars = Array.from(text).length
  const bytes = getByteLength(text)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split('\n').length : 0
  const noSpaces = text.replace(/\s/g,'').length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length

  const stats = [
    { label: 'Characters', value: chars },
    { label: 'Characters (no spaces)', value: noSpaces },
    { label: 'Words', value: words },
    { label: 'Lines', value: lines },
    { label: 'Sentences', value: sentences },
    { label: 'Bytes (UTF-8)', value: bytes },
  ]

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('string-length-counter')
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); track() }}
          placeholder="Paste or type your text here..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} onClick={() => copy(String(s.value), s.label)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors group">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-brand-700">{s.value.toLocaleString()}</p>
              <p className="text-xs text-brand-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied===s.label ? '\u2713 Copied' : 'Click to copy'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
