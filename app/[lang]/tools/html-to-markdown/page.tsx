'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-to-markdown')!
const BT = '`'
function htmlToMd(html:string):string{
  let s=html
  s=s.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi,(_,l,t)=>'#'.repeat(parseInt(l))+' '+t.replace(/<[^>]+>/g,'')+'\n
')\n  s=s.replace(/<strong[^>]*>(.*?)<\/strong>/gi,'**$1**')
  s=s.replace(/<b[^>]*>(.*?)<\/b>/gi,'**$1**')
  s=s.replace(/<em[^>]*>(.*?)<\/em>/gi,'_$1_')
  s=s.replace(/<i[^>]*>(.*?)<\/i>/gi,'_$1_')
  s=s.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,BT+BT+BT+'\n$1\n'+BT+BT+BT+'\n\n')
  s=s.replace(/<code[^>]*>(.*?)<\/code>/gi,BT+'$1'+BT)
  s=s.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,'[$2]($1)')\n  s=s.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/gi,'![$2]($1)')
  s=s.replace(/<li[^>]*>(.*?)<\/li>/gi,'- $1\n')
  s=s.replace(/<ul[^>]*>|<\/ul>/gi,'')
  s=s.replace(/<ol[^>]*>|<\/ol>/gi,'')
  s=s.replace(/<p[^>]*>(.*?)<\/p>/gi,'$1\n\n')
  s=s.replace(/<br\s*\/?>/gi,'\n')
  s=s.replace(/<hr\s*\/?>/gi,'---\n\n')
  s=s.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis,'>$1\n')
  s=s.replace(/<[^>]+>/g,'')
  s=s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ')
  s=s.replace(/\n{3,}/g,'\n\n').trim()
  return s
}
const SAMPLE='<h1>Sample Article</h1>\n<p>This is a <strong>bold</strong> and <em>italic</em> paragraph with a <a href="https://example.com">link</a>.</p>\n<h2>Features</h2>\n<ul>\n  <li>Convert HTML to clean Markdown</li>\n  <li>Supports inline code snippets</li>\n  <li>Handles headings, lists, and links</li>\n</ul>\n<blockquote>Markdown is better for writing.</blockquote>'
export default function HtmlToMarkdownPage() {
  const [input,setInput]=useState(SAMPLE)
  const [copied,setCopied]=useState(false)
  const md=htmlToMd(input)
  const copy=()=>{navigator.clipboard.writeText(md);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">HTML input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={14}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Markdown output</label>
            <button onClick={copy} className="text-xs text-blue-500 hover:text-blue-700">{copied?'Copied':'Copy'}</button>
          </div>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xs h-64 overflow-auto whitespace-pre">{md}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}