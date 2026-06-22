'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('word-counter')!

export default function WordCounterPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter((s) => s.trim()).length
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length
  const readingTime = Math.max(1, Math.round(words / 200))

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here…"
        className="w-full h-56 p-4 border border-gray-200 rounded-xl resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Words', value: words },
          { label: 'Characters', value: chars },
          { label: 'Chars (no spaces)', value: charsNoSpace },
          { label: 'Sentences', value: sentences },
          { label: 'Paragraphs', value: paragraphs },
          { label: 'Reading time', value: `~${readingTime} min` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      {text && (
        <button onClick={() => setText('')} className="mt-4 text-sm text-gray-400 hover:text-red-500 transition-colors">Clear</button>
      )}
    </ToolLayout>
  )
}