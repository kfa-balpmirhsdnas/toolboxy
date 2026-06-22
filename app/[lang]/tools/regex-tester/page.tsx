'use client'
import { useState } from 'react'

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('')

  let matches: RegExpMatchArray[] = []
  let regexError = ''
  let highlightedParts: { text: string; matched: boolean }[] = []

  if (pattern) {
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      const allMatches = [...testStr.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))]
      matches = allMatches as RegExpMatchArray[]

      // Build highlight parts
      let lastIdx = 0
      for (const m of allMatches) {
        const start = m.index ?? 0
        if (start > lastIdx) highlightedParts.push({ text: testStr.slice(lastIdx, start), matched: false })
        highlightedParts.push({ text: m[0], matched: true })
        lastIdx = start + m[0].length
      }
      if (lastIdx < testStr.length) highlightedParts.push({ text: testStr.slice(lastIdx), matched: false })
    } catch (e: unknown) {
      regexError = e instanceof Error ? e.message : 'Invalid regex'
    }
  }

  const FLAG_LIST = ['g','i','m','s','u']

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Regex Tester</h1>
        <p className="text-gray-500 mb-8">Test and debug regular expressions with real-time match highlighting.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  className={`w-full border rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 ${regexError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="e.g. \\b\\w+@\\w+\\.\\w+\\b"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                />
                {regexError && <p className="text-red-500 text-xs mt-1">{regexError}</p>}
              </div>
              <div className="flex gap-1">
                {FLAG_LIST.map(f => (
                  <button key={f} onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f,'') : prev+f)}
                    className={`px-2 py-3 text-xs font-mono rounded border transition-colors ${flags.includes(f) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test String</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your test text here..."
              value={testStr}
              onChange={e => setTestStr(e.target.value)}
            />
          </div>
          {testStr && pattern && !regexError && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matches <span className="text-blue-600 font-normal">({matches.length} found)</span>
                </label>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm font-mono leading-relaxed break-all">
                  {highlightedParts.length > 0 ? highlightedParts.map((p, i) => (
                    <span key={i} className={p.matched ? 'bg-yellow-200 text-yellow-900 rounded px-0.5' : ''}>{p.text}</span>
                  )) : <span className="text-gray-400">No matches found</span>}
                </div>
              </div>
              {matches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match List</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {matches.map((m, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-gray-400 w-6 text-right">{i+1}.</span>
                        <code className="bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded text-yellow-800">{m[0]}</code>
                        {m.index !== undefined && <span className="text-gray-400">at {m.index}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
