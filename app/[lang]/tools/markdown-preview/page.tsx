'use client'
import { useState, useRef, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('markdown-preview')!

function escHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function parseMarkdown(md: string): string {
  let html = md
  // Code blocks
  html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, (_,c) => '<pre class="bg-gray-100 rounded p-3 overflow-x-auto text-sm"><code>' + escHtml(c.trim()) + '</code></pre>')
  // Headings
  html = html.replace(/^#{6} (.+)$/gm,'<h6 class="text-xs font-bold mt-2">$1</h6>')
  html = html.replace(/^#{5} (.+)$/gm,'<h5 class="text-sm font-bold mt-2">$1</h5>')
  html = html.replace(/^#{4} (.+)$/gm,'<h4 class="text-base font-bold mt-3">$1</h4>')
  html = html.replace(/^### (.+)$/gm,'<h3 class="text-lg font-bold mt-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm,'<h2 class="text-xl font-bold mt-4 border-b pb-1">$1</h2>')
  html = html.replace(/^# (.+)$/gm,'<h1 class="text-2xl font-bold mt-4 border-b pb-2">$1</h1>')
  // Bold/italic/code
  html = html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g,'<em>$1</em>')
  html = html.replace(/\`([^\`]+)\`/g,'<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g,'<del>$1</del>')
  // Links and images
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" class="max-w-full rounded" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')
  // Blockquote
  html = html.replace(/^> (.+)$/gm,'<blockquote class="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-2">$1</blockquote>')
  // HR
  html = html.replace(/^---$/gm,'<hr class="my-4 border-gray-200" />')
  // Lists
  html = html.replace(/^[*-] (.+)$/gm,'<li class="ml-5 list-disc">$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm,'<li class="ml-5 list-decimal">$1</li>')
  // Paragraphs
  html = html.replace(/\n{2,}/g,'</p><p class="my-2">')
  html = '<p class="my-2">' + html + '</p>'
  html = html.replace(/\n/g,'<br />')
  return html
}

const SAMPLE = `# Hello, Markdown!

This is a **bold** and *italic* preview tool.

## Features

- Headings (H1–H6)
- **Bold**, *italic*, \`code\`
- [Links](https://toolboxy.net)
- Blockquotes and HR

> This is a blockquote

---

\`\`\`
const greeting = "Hello World"
console.log(greeting)
\`\`\`
`

export default function MarkdownPreviewPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('markdown-preview'); tracked.current = true }
  }

  const html = useMemo(() => parseMarkdown(text), [text])

  async function copy() {
    await navigator.clipboard.writeText(text)
    trackToolCopy('markdown-preview')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function download() {
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='document.md'; a.click(); URL.revokeObjectURL(url)
    trackToolDownload('markdown-preview','md')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{text.length} chars | {text.split('\n').length} lines</p>
          <div className="flex gap-2">
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy MD'}</button>
            <button onClick={download} className="text-xs text-brand-600 hover:underline">Download</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 min-h-96">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Markdown</label>
            <textarea value={text} onChange={e=>{setText(e.target.value);track()}} rows={20}
              className="w-full h-full px-3 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
            <div className="h-full p-4 border border-gray-200 rounded-xl overflow-y-auto prose prose-sm max-w-none text-sm text-gray-800" 
              dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
