'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('text-to-slug')!

function toSlug(text: string, separator: string, lowercase: boolean): string {
  let s = text.trim()
  // Normalize accents
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  if (lowercase) s = s.toLowerCase()
  // Replace non-alphanumeric with separator
  s = s.replace(/[^a-zA-Z0-9]+/g, separator)
  // Remove leading/trailing separator
  s = s.replace(new RegExp('^[' + separator + ']+|[' + separator + ']+$', 'g'), '')
  return s
}

export default function TextToSlugPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [separator, setSeparator] = useState('-')
  const [lowercase, setLowercase] = useState(true)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('text-to-slug'); tracked.current = true }
  }

  const output = input ? toSlug(input, separator, lowercase) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('text-to-slug')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); track() }}
          placeholder="Enter title or text to convert to slug..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
            <div className="flex gap-1">
              {[['-','Hyphen'],['_','Underscore'],['.','Dot']].map(([sep,label]) => (
                <button key={sep} onClick={() => { setSeparator(sep); track() }}
                  className={'px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ' + (separator===sep ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {sep} <span className="text-xs font-sans opacity-70">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={lowercase} onChange={e => { setLowercase(e.target.checked); track() }} className="w-4 h-4 accent-brand-600" />
            <span className="text-sm font-medium text-gray-700">Lowercase</span>
          </label>
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Slug</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? '\u2713 Copied' : 'Copy'}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-800 break-all">
              {output}
            </div>
          </div>
        )}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
          <strong>Example:</strong> &quot;Hello World! This is a Test.&quot; \u2192 hello-world-this-is-a-test
        </div>
      </div>
    </ToolLayout>
  )
}
