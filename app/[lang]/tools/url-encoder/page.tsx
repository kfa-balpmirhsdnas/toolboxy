'use client'

import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('url-encoder')!

export default function UrlEncoderPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)
  const trackedRef = useRef(false)

  const output = (() => {
    if (!input) return ''
    try {
      return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
    } catch {
      return '⚠ Invalid input'
    }
  })()

  useEffect(() => {
    if (output && !output.startsWith('⚠') && !trackedRef.current) {
      trackedRef.current = true
      trackToolUsed('url-encoder', mode)
    }
  }, [output, mode])

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('url-encoder')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['encode', 'decode'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setInput(''); trackedRef.current = false }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors capitalize ${
                mode === m ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'
              }`}
            >
              {m === 'encode' ? '→ Encode' : '← Decode'}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'encode' ? 'Plain URL / text' : 'Encoded URL'}
          </label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); trackedRef.current = false }}
            placeholder={mode === 'encode' ? 'https://example.com/search?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'}
            className="w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {output && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">{mode === 'encode' ? 'ENCODED' : 'DECODED'}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-600 bg-gray-50 focus:outline-none"
              />
              {!output.startsWith('⚠') && (
                <button
                  onClick={copy}
                  className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Uses <code>encodeURIComponent</code> / <code>decodeURIComponent</code> · Updates in real-time</p>
      </div>
    </ToolLayout>
  )
}
