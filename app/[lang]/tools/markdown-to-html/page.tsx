'use client'
import { useState } from 'react'

function markdownToHtml(md: string): string {
  let html = md
  const codeBlocks: string[] = []
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const inner = match.slice(3,-3)
    const langMatch = inner.match(/^(\w+)\n/)
    const code = langMatch ? inner.slice(langMatch[0].length) : inner
    const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    codeBlocks.push('<pre><code>'+escaped+'</code></pre>')
    return '\x00CODE'+(codeBlocks.length-1)+'\x00'
  })
  html = html.replace(/`([^`]+)`/g,(_,c)=>'<code>'+c.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</code>')
  html = html.replace(/^#{6}\s+(.+)$/gm,'<h6>$1</h6>')
  html = html.replace(/^#{5}\s+(.+)$/gm,'<h5>$1</h5>')
  html = html.replace(/^#{4}\s+(.+)$/gm,'<h4>$1</h4>')
  html = html.replace(/^#{3}\s+(.+)$/gm,'<h3>$1</h3>')
  html = html.replace(/^#{2}\s+(.+)$/gm,'<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm,'<h1>$1</h1>')
  html = html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g,'<em>$1</em>')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1"/>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
  html = html.replace(/^>\s+(.+)$/gm,'<blockquote>$1</blockquote>')
  html = html.replace(/^[-+*]\s+(.+)$/gm,'<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>')
  const lines = html.split('\n\n')
  html = lines.map(line => {
    const t = line.trim()
    if (!t) return ''
    if (/^<(h[1-6]|ul|ol|blockquote|pre|hr)/.test(t)) return t
    return '<p>'+t+'</p>'
  }).join('\n')
  codeBlocks.forEach((b,i) => { html = html.replace('\x00CODE'+i+'\x00', b) })
  return html
}

const SAMPLE = `# Hello World

This is **bold** and *italic* text.

## Features

- Converts Markdown to clean HTML
- Supports **headings**, *emphasis*, and \`code\`
- Live preview

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> Blockquotes look like this.`

export default function MarkdownToHtml() {
  const [md, setMd] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'preview'|'source'>('preview')
  const html = markdownToHtml(md)
  const copy = async () => { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown to HTML</h1>
        <p className="text-gray-500 mb-8">Convert Markdown to clean HTML instantly. Live preview included.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-700 text-sm">Markdown Input</span>
              <button onClick={()=>setMd('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
            <textarea value={md} onChange={e=>setMd(e.target.value)} className="flex-1 p-5 font-mono text-sm resize-none focus:outline-none rounded-b-2xl" rows={22} placeholder="Type Markdown here..."/>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div className="flex gap-2">
                {(['preview','source'] as const).map(t=>(
                  <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${tab===t?'bg-blue-600 text-white':'text-gray-500 hover:bg-gray-100'}`}>
                    {t==='preview'?'👁 Preview':'</> Source'}
                  </button>
                ))}
              </div>
              <button onClick={copy} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium transition-colors">
                {copied?'✓ Copied!':'Copy HTML'}
              </button>
            </div>
            {tab==='preview'
              ? <div className="flex-1 p-5 overflow-auto prose max-w-none" dangerouslySetInnerHTML={{__html:html}}/>
              : <pre className="flex-1 p-5 text-xs font-mono overflow-auto text-gray-700 whitespace-pre-wrap">{html}</pre>
            }
          </div>
        </div>
      </div>
    </div>
  )
}