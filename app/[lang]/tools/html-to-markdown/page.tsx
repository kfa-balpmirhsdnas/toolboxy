'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('html-to-markdown')!

function htmlToMarkdown(html: string): string {
  let md = html
  // Remove scripts and styles
  md = md.replace(/<script[\s\S]*?<\/script>/gi,'')
  md = md.replace(/<style[\s\S]*?<\/style>/gi,'')
  // Headings
  for (let i=6;i>=1;i--) md = md.replace(new RegExp('<h'+i+'[^>]*>([\\s\\S]*?)<\/h'+i+'>','gi'),(_,t)=>'\n'+'#'.repeat(i)+' '+t.replace(/<[^>]+>/g,'').trim()+'\n')
  // Bold/italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi,'**$2**')
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi,'*$2*')
  // Code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,(_,c)=>'\n```\n'+c.replace(/<[^>]+>/g,'').trim()+'\n```\n')
  md = md.replace(/<code[^>]*>([^<]+)<\/code>/gi,'`$1`')
  // Links
  md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi,'[$2]($1)')
  // Images
  md = md.replace(/<img[^>]+alt="([^"]*)"[^>]+src="([^"]+)"[^>]*\/?>/gi,'![$1]($2)')
  md = md.replace(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*\/?>/gi,'![$2]($1)')
  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,(_,c)=>c.split('\n').map((l:string)=>'> '+l).join('\n'))
  // Lists
  md = md.replace(/<ul[^>]*>([sS]*?)<\/ul>/gi,(_,c)=>c)
  md = md.replace(/<ol[^>]*>([sS]*?)<\/ol>/gi,(_,c)=>c)
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,'- $1')
  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi,'$1\n\n')
  md = md.replace(/<br\s*\/?>/gi,'\n')
  md = md.replace(/<hr\s*\/?>/gi,'\n---\n')
  // Strikethrough
  md = md.replace(/<(del|s)[^>]*>([\s\S]*?)<\/(del|s)>/gi,'~~$2~~')
  // Strip remaining tags
  md = md.replace(/<[^>]+>/g,'')
  // Decode HTML entities
  md = md.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
  // Clean up whitespace
  md = md.replace(/\n{3,}/g,'\n\n').trim()
  return md
}

export default function HtmlToMarkdownPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('<h1>Hello World</h1>\n<p>This is a <strong>bold</strong> paragraph with a <a href="https://toolboxy.net">link</a>.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('html-to-markdown'); tracked.current = true }
  }

  const output = input.trim() ? htmlToMarkdown(input) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('html-to-markdown')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">HTML Input</label>
            <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={12}
              className="w-full px-3 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Markdown Output</label>
              {output && <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>}
            </div>
            <div className="h-full px-3 py-3 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50 whitespace-pre-wrap break-words min-h-48 max-h-80 overflow-y-auto">
              {output || <span className="text-gray-400">Output appears here...</span>}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
