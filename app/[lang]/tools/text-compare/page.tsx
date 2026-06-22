'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('text-compare')!

type DiffLine = { type: 'same' | 'added' | 'removed'; text: string }

function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  const m = linesA.length, n = linesB.length
  // Simple LCS-based diff
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = linesA[i-1] === linesB[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1])

  const result: DiffLine[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i-1] === linesB[j-1]) {
      result.unshift({ type: 'same', text: linesA[i-1] }); i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      result.unshift({ type: 'added', text: linesB[j-1] }); j--
    } else {
      result.unshift({ type: 'removed', text: linesA[i-1] }); i--
    }
  }
  return result
}

export default function TextComparePage({ params }: { params: { lang: string } }) {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [diff, setDiff] = useState<DiffLine[] | null>(null)
  const [tracked, setTracked] = useState(false)

  function compare() {
    if (!tracked) { trackToolUsed('text-compare'); setTracked(true) }
    setDiff(diffLines(left, right))
  }

  const added = diff?.filter(d => d.type === 'added').length ?? 0
  const removed = diff?.filter(d => d.type === 'removed').length ?? 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Original Text</label>
            <textarea
              value={left}
              onChange={e => { setLeft(e.target.value); setDiff(null) }}
              placeholder="Paste original text here…"
              className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modified Text</label>
            <textarea
              value={right}
              onChange={e => { setRight(e.target.value); setDiff(null) }}
              placeholder="Paste modified text here…"
              className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <button
          onClick={compare}
          disabled={!left && !right}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Compare
        </button>
        {diff && (
          <>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium">+{added} added</span>
              <span className="text-red-500 font-medium">−{removed} removed</span>
              {added === 0 && removed === 0 && <span className="text-gray-500">✓ Identical</span>}
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden font-mono text-xs">
              {diff.map((line, i) => (
                <div
                  key={i}
                  className={`px-4 py-0.5 flex gap-3 ${
                    line.type === 'added' ? 'bg-green-50 text-green-800' :
                    line.type === 'removed' ? 'bg-red-50 text-red-700 line-through' :
                    'bg-white text-gray-700'
                  }`}
                >
                  <span className="select-none w-4 shrink-0 text-gray-400">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.text || '\u00a0'}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Line-by-line diff · Green = added · Red = removed</p>
      </div>
    </ToolLayout>
  )
}
