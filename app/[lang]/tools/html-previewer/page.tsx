'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('html-previewer')!

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1f2937; }
    h1 { color: #6366f1; }
    button { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit the HTML on the left to see a live preview.</p>
  <button onclick="alert('Hello!')">Click me</button>
</body>
</html>`

export default function HtmlPreviewerPage({ params }: { params: { lang: string } }) {
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [layout, setLayout] = useState<'split'|'preview'>('split')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('html-previewer'); tracked.current = true } }
  async function copy() { await navigator.clipboard.writeText(html); trackToolCopy('html-previewer'); setCopied(true); setTimeout(()=>setCopied(false),1500) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['split','preview'] as const).map(l=>(
              <button key={l} onClick={()=>setLayout(l)}
                className={'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ' + (layout===l?'bg-gray-800 text-white':'bg-gray-100 text-gray-600')}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'✓ Copied HTML':'Copy HTML'}</button>
        </div>
        <div className={`${layout==='split'?'grid grid-cols-2 gap-3':'flex flex-col'}`} style={{height:480}}>
          {layout==='split' && (
            <textarea value={html} onChange={e=>{setHtml(e.target.value);track()}}
              className="h-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          )}
          <div className={`border-2 border-gray-200 rounded-xl overflow-hidden bg-white ${layout==='preview'?'h-full':''}`}>
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 ml-2">Preview</span>
            </div>
            <iframe srcDoc={html} title="preview" className="w-full" style={{height:layout==='split'?'calc(100% - 32px)':'432px',border:'none'}} sandbox="allow-scripts allow-popups" />
          </div>
          {layout==='preview' && (
            <textarea value={html} onChange={e=>{setHtml(e.target.value);track()}} rows={8}
              className="px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
