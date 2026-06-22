'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('character-counter')!

export default function CharacterCounterPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('character-counter'); tracked.current = true }
  }

  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g,'').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split('\n').length : 0
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length
  const letters = (text.match(/[a-zA-Z\u00C0-\u024F]/g)||[]).length
  const digits = (text.match(/[0-9]/g)||[]).length
  const spaces = (text.match(/ /g)||[]).length
  const specialChars = text.length - letters - digits - spaces - (text.match(/\n/g)||[]).length

  const stats = [
    { label: 'Characters', value: chars },
    { label: 'No Spaces', value: charsNoSpaces },
    { label: 'Words', value: words },
    { label: 'Lines', value: lines },
    { label: 'Sentences', value: sentences },
    { label: 'Paragraphs', value: paragraphs },
    { label: 'Letters', value: letters },
    { label: 'Digits', value: digits },
    { label: 'Spaces', value: spaces },
    { label: 'Special', value: specialChars < 0 ? 0 : specialChars },
  ]

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('character-counter')
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const readTime = Math.ceil(words / 200) // avg 200 wpm

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); track() }}
          placeholder="Paste or type your text here..."
          rows={7}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        {words > 0 && (
          <p className="text-xs text-gray-500 text-right">
            \u23F1 ~{readTime} min read
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {stats.map(s => (
            <div key={s.label} onClick={() => copy(String(s.value), s.label)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors group text-center">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-brand-700">{s.value.toLocaleString()}</p>
              <p className="text-xs text-brand-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied===s.label ? '\u2713' : 'copy'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
