'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('html-formatter')!

function formatHtml(html: string, indent: number): string {
  const INLINE = new Set(['a','abbr','acronym','b','bdo','big','br','cite','code','dfn','em','i','img','input','kbd','label','map','object','output','q','samp','select','small','span','strong','sub','sup','textarea','time','tt','var'])
  const tab = ' '.repeat(indent)
  let result = ''
  let level = 0
  const tokens = html.match(/<[^>]+>|[^<]+/g) || []
  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('<!') || trimmed.startsWith('<?')) {
      result += tab.repeat(level) + trimmed + '\n'; continue
    }
    if (trimmed.startsWith('</')) {
      const tag = trimmed.slice(2,-1).toLowerCase().split(/[\s/]/)[0]
      if (!INLINE.has(tag)) { level = Math.max(0,level-1); result += tab.repeat(level) + trimmed + '\n' }
      else result = result.trimEnd() + trimmed + '\n'
    } else if (trimmed.startsWith('<')) {
      const tag = trimmed.slice(1).split(/[\s/>/]/)[0].toLowerCase()
      const selfClose = trimmed.endsWith('/>') || ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].includes(tag)
      if (!INLINE.has(tag)) { result += tab.repeat(level) + trimmed + '\n'; if (!selfClose) level++ }
      else result = (result.trimEnd()||'') + (result.endsWith('\n') ? tab.repeat(level) : '') + trimmed
    } else {
      result += tab.repeat(level) + trimmed + '\n'
    }
  }
  return result.trim()
}

export default function HtmlFormatterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('html-formatter'); tracked.current = true }
  }

  const output = input.trim() ? (() => { try { return formatHtml(input, indent) } catch { return 'Error formatting HTML' } })() : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('html-formatter')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function download() {
    const blob = new Blob([output], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='formatted.html'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('html-formatter','html')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <label className="text-xs font-medium text-gray-600">Indent size</label>
          {[2,4].map(n => (
            <button key={n} onClick={()=>setIndent(n)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (indent===n?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {n} spaces
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">HTML Input</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="Paste HTML to format..." rows={7}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Formatted Output</label>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
                <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
              </div>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-64">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
