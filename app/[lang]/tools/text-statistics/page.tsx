'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function analyze(text: string) {
  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) || []).length || (text.trim().length > 0 ? 1 : 0)
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim().length > 0 ? 1 : 0)
  const readingTime = Math.ceil(words / 200)
  const speakingTime = Math.ceil(words / 130)
  const avgWordLen = words > 0 ? (charsNoSpaces / words).toFixed(1) : '0'
  const uniqueWords = words > 0 ? new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size : 0
  return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, speakingTime, avgWordLen, uniqueWords }
}


const tool = getToolBySlug('text-statistics')!

export default function TextStatisticsPage() {
  const [text, setText] = useState('')
  const s = analyze(text)

  const stats = [
    { label: 'Characters', value: s.chars },
    { label: 'Characters (no spaces)', value: s.charsNoSpaces },
    { label: 'Words', value: s.words },
    { label: 'Unique words', value: s.uniqueWords },
    { label: 'Sentences', value: s.sentences },
    { label: 'Paragraphs', value: s.paragraphs },
    { label: 'Avg. word length', value: s.avgWordLen },
    { label: 'Reading time', value: s.readingTime + ' min' },
    { label: 'Speaking time', value: s.speakingTime + ' min' },
  ]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Statistics</h1>
        <p className="text-gray-500 mb-8">Analyze your text — word count, reading time, sentence stats, and more.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste or type your text here..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            {stats.map(st => (
              <div key={st.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{st.value}</div>
                <div className="text-xs text-gray-500 mt-1">{st.label}</div>
              </div>
            ))}
          </div>
          {text && (
            <button onClick={() => setText('')} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
              Clear text
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
