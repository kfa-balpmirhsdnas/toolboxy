'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('regex-tester')!

export default function RegexTesterPage({ params }: { params: { lang: string } }) {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<RegExpMatchArray[]>([])
  const [error, setError] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const tracked = useRef(false)

  function test() {
    if (!pattern) return
    if (!tracked.current) { trackToolUsed('regex-tester'); tracked.current = true }
    try {
      const re = new RegExp(pattern, flags)
      const all: RegExpMatchArray[] = []
      let m: RegExpMatchArray | null
      if (flags.includes('g')) {
        const tmp = new RegExp(pattern, flags)
        while ((m = tmp.exec(text)) !== null) {
          all.push(m)
          if (all.length > 500) break
        }
      } else {
        m = re.exec(text)
        if (m) all.push(m)
      }
      setMatches(all)
      setMatchCount(all.length)
      setError('')
    } catch (e: unknown) {
      setError((e as Error).message)
      setMatches([])
      setMatchCount(0)
    }
  }

  function highlight() {
    if (!pattern || !text) return text
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      return text.replace(re, m => '<mark class="bg-yellow-200 rounded px-0.5">' + m + '</mark>')
    } catch { return text }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
            <input
              value={pattern}
              onChange={e => { setPattern(e.target.value); setMatches([]); setError('') }}
              placeholder="e.g. \d+"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flags</label>
            <input
              value={flags}
              onChange={e => setFlags(e.target.value)}
              placeholder="g i m"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test String</label>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setMatches([]); setError('') }}
            rows={6}
            placeholder="Paste your text here..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          onClick={test}
          disabled={!pattern || !text}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Test Regex
        </button>
        {error && <p className="text-sm text-red-600 font-mono bg-red-50 p-3 rounded-xl border border-red-200">&#x274C; {error}</p>}
        {matches.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">{matchCount} match{matchCount !== 1 ? 'es' : ''} found</p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlight() }} />
            <div className="space-y-2">
              {matches.slice(0, 20).map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl text-sm">
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded font-mono shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <span className="font-mono text-gray-800">&ldquo;{m[0]}&rdquo;</span>
                    <span className="text-gray-400 ml-2 text-xs">index {m.index}</span>
                    {m.length > 1 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Groups: {m.slice(1).map((g, gi) => (
                          <span key={gi} className="mr-2 font-mono">#{gi + 1}=&ldquo;{g ?? 'undefined'}&rdquo;</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {matches.length > 20 && <p className="text-xs text-gray-400">...and {matches.length - 20} more</p>}
            </div>
          </div>
        )}
        {pattern && text && matches.length === 0 && !error && (
          <p className="text-sm text-gray-500 italic">No matches found.</p>
        )}
      </div>
    </ToolLayout>
  )
}
