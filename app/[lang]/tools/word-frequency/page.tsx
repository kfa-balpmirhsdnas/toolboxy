'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('word-frequency')!

interface WordEntry { word: string; count: number; pct: string }

function analyze(text: string): WordEntry[] {
  if (!text.trim()) return []
  const words = text.toLowerCase().match(/\b[a-z'\u00C0-\u024F]+\b/g) || []
  const map: Record<string, number> = {}
  for (const w of words) map[w] = (map[w] || 0) + 1
  const total = words.length
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count, pct: ((count / total) * 100).toFixed(1) }))
}

export default function WordFrequencyPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('word-frequency'); tracked.current = true }
  }

  const entries = analyze(text)
  const wordCount = text.trim() ? (text.toLowerCase().match(/\b[a-z'\u00C0-\u024F]+\b/g) || []).length : 0
  const charCount = text.length
  const uniqueWords = entries.length

  async function copyResults() {
    const csv = 'Word,Count,Frequency\n' + entries.map(e => `${e.word},${e.count},${e.pct}%`).join('\n')
    await navigator.clipboard.writeText(csv)
    trackToolCopy('word-frequency')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); track() }}
          placeholder="Paste or type your text here..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {text.trim() && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[['Total Words', wordCount], ['Unique Words', uniqueWords], ['Characters', charCount]].map(([label, val]) => (
                <div key={label as string} className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-center">
                  <p className="text-xl font-bold text-brand-800">{val}</p>
                  <p className="text-xs text-brand-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Word Frequency ({entries.length} words)</h3>
              <button onClick={copyResults} className="text-xs text-brand-600 hover:underline">
                {copied ? '\u2713 Copied' : 'Copy as CSV'}
              </button>
            </div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {entries.slice(0, 50).map(({ word, count, pct }) => (
                <div key={word} className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-700 w-36 shrink-0 truncate">{word}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: pct + '%' }} />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right shrink-0">{count}x ({pct}%)</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
