'use client'

import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('url-decoder')!

export default function UrlDecoderPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const trackedRef = useRef(false)

  const output = (() => {
    if (!input) return ''
    try { return decodeURIComponent(input) } catch { return '⚠ Invalid URL-encoded input' }
  })()

  useEffect(() => {
    if (output && !output.startsWith('⚠') && !trackedRef.current) {
      trackedRef.current = true
      trackToolUsed('url-decoder', 'decode')
    }
  }, [output])

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('url-decoder')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Encoded URL / Text</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); trackedRef.current = false }}
            placeholder="https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"
            className="w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {output && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">DECODED</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className={`w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono bg-gray-50 focus:outline-none ${output.startsWith('⚠') ? 'text-red-500' : 'text-gray-600'}`}
              />
              {!output.startsWith('⚠') && (
                <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Uses <code>decodeURIComponent</code> · Updates in real-time</p>
      </div>
    </ToolLayout>
  )
}
