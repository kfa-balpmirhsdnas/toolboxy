'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('hash-generator')!

const ALGOS = ['SHA-1','SHA-256','SHA-384','SHA-512']

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)

  async function computeHashes(text: string) {
    if (!text) { setHashes({}); return }
    setLoading(true)
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const results: Record<string,string> = {}
    for (const algo of ALGOS) {
      const buf = await crypto.subtle.digest(algo, data)
      results[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
    }
    setHashes(results)
    setLoading(false)
    trackToolUsed('hash-generator')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); computeHashes(e.target.value) }}
            placeholder="Enter text to hash..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>
        {loading && <p className="text-sm text-gray-500">Computing...</p>}
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">{algo}</span>
              <button
                onClick={() => navigator.clipboard.writeText(hash)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >Copy</button>
            </div>
            <p className="font-mono text-xs text-gray-600 break-all">{hash}</p>
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}