'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('css-minifier')!

function minifyCss(css: string): string {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace around selectors, properties
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    // Remove trailing semicolons before }
    .replace(/;}/g, '}')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing spaces inside rules
    .replace(/{ /g, '{').replace(/ }/g, '}')
    // Remove spaces after colons in values (careful)
    .replace(/: /g, ':')
    .trim()
}

const PLACEHOLDER = `.container {
  display: flex;
  align-items: center;
  /* Center the items */
  justify-content: space-between;
  padding: 16px 24px;
  margin: 0 auto;
}

.button {
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
}`

export default function CssMinifierPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function minify() {
    if (!input.trim()) return
    if (!tracked.current) { trackToolUsed('css-minifier'); tracked.current = true }
    setOutput(minifyCss(input))
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('css-minifier')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    trackToolDownload('css-minifier', 'css')
    const blob = new Blob([output], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'style.min.css'; a.click()
    URL.revokeObjectURL(url)
  }

  const savings = input.length > 0 && output.length > 0
    ? Math.round((1 - output.length / input.length) * 100)
    : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSS Input</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setOutput('') }}
            placeholder={PLACEHOLDER}
            className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <button
          onClick={minify}
          disabled={!input.trim()}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Minify CSS
        </button>
        {output && (
          <>
            {savings !== null && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">{input.length} → {output.length} bytes</span>
                <span className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full text-xs">
                  {savings}% smaller
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">MINIFIED OUTPUT</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-600 bg-gray-50 focus:outline-none"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={copy} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={download} className="text-xs bg-brand-600 text-white px-2 py-1 rounded-lg hover:bg-brand-700">
                  Download
                </button>
              </div>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">Removes comments, whitespace, and unnecessary characters · No external dependencies</p>
      </div>
    </ToolLayout>
  )
}
