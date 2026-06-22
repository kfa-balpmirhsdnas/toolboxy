'use client'
import { useState } from 'react'

// Minimal markdown parser
function parseMarkdown(md:string):string{
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // headings
    .replace(/^#{6}\s(.+)$/gm,'<h6 class="text-sm font-bold mt-4 mb-1">$1</h6>')
    .replace(/^#{5}\s(.+)$/gm,'<h5 class="text-base font-bold mt-4 mb-1">$1</h5>')
    .replace(/^#{4}\s(.+)$/gm,'<h4 class="text-lg font-bold mt-4 mb-1">$1</h4>')
    .replace(/^#{3}\s(.+)$/gm,'<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>')
    .replace(/^#{2}\s(.+)$/gm,'<h2 class="text-2xl font-bold mt-6 mb-2">$1</h2>')
    .replace(/^#\s(.+)$/gm,'<h1 class="text-3xl font-bold mt-6 mb-3">$1</h1>')
    // bold / italic
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g,'<code class="bg-gray-100 text-red-600 px-1 rounded font-mono text-sm">$1</code>')
    // blockquote
    .replace(/^&gt;\s?(.+)$/gm,'<blockquote class="border-l-4 border-gray-300 pl-4 text-gray-500 italic my-2">$1</blockquote>')
    // hr
    .replace(/^---$/gm,'<hr class="my-4 border-gray-300" />')
    // unordered list
    .replace(/^[\*\-]\s(.+)$/gm,'<li class="ml-4 list-disc">$1</li>')
    // ordered list
    .replace(/^\d+\.\s(.+)$/gm,'<li class="ml-4 list-decimal">$1</li>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" class="text-brand-600 underline" target="_blank" rel="noopener">$1</a>')
    // paragraphs
    .replace(/\n\n/g,'</p><p class="my-2">')
    .replace(/^(.)/,'<p class="my-2">$1')
  +('</p>')
}

const SAMPLE='# Hello World\n\nThis is **bold** and *italic* text.\n\n## Features\n\n- Easy to use\n- Real-time preview\n- Copy HTML output\n\n> Blockquotes are supported too!\n\nInline `code` looks like this.\n\n[Link example](https://toolboxy.net)'

export default function MarkdownToHtmlPage() {
  const [input,setInput]=useState(SAMPLE)
  const [tab,setTab]=useState<'preview'|'html'>('preview')
  const [copied,setCopied]=useState(false)

  const html=parseMarkdown(input)
  function copy(){navigator.clipboard.writeText(html);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown to HTML</h1>
        <p className="text-gray-500 mb-6">Convert Markdown to HTML with a live side-by-side preview</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-medium text-gray-600">Markdown</span>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={20}
              className="w-full p-4 font-mono text-sm focus:outline-none resize-none" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-1">
                {(['preview','html'] as const).map(t=>(
                  <button key={t} onClick={()=>setTab(t)} className={'px-3 py-1 text-xs rounded-md capitalize '+(tab===t?'bg-white shadow text-gray-800 font-medium':'text-gray-500')}>{t}</button>
                ))}
              </div>
              <button onClick={copy} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">{copied?'\u2713':'Copy HTML'}</button>
            </div>
            {tab==='preview'?(
              <div className="p-4 overflow-auto h-[500px] prose max-w-none" dangerouslySetInnerHTML={{__html:html}} />
            ):(
              <pre className="p-4 font-mono text-xs text-gray-700 overflow-auto h-[500px] whitespace-pre-wrap break-all">{html}</pre>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}