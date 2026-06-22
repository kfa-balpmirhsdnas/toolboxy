'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-to-markdown')!
const BT = '`'
function htmlToMd(html:string):string{
  let s=html
  s=s.replace(/<h1[^>]*>([sS]*?)<\/h1>/gi,(_,t)=>'# '+t.replace(/<[^>]+>/g,'').trim()+'\n\n')
  s=s.replace(/<h2[^>]*>([sS]*?)<\/h2>/gi,(_,t)=>'## '+t.replace(/<[^>]+>/g,'').trim()+'\n\n')
  s=s.replace(/<h3[^>]*>([sS]*?)<\/h3>/gi,(_,t)=>'### '+t.replace(/<[^>]+>/g,'').trim()+'\n\n')
  s=s.replace(/<h4[^>]*>([sS]*?)<\/h4>/gi,(_,t)=>'#### '+t.replace(/<[^>]+>/g,'').trim()+'\n\n')
  s=s.replace(/<h5[^>]*>([sS]*?)<\/h5>/gi,(_,t)=>'##### '+t.replace(/<[^>]+>/g,'').trim()+'\n\n')
  s=s.replace(/<h6[^>]*>([sS]*?)<\/h6>/gi,(_,t)=>'###### '+t.replace(/<[^>]+>/g,'').trim()+'\n\n')
  s=s.replace(/<strong[^>]*>([sS]*?)<\/strong>/gi,'**$1**')
  s=s.replace(/<b[^>]*>([sS]*?)<\/b>/gi,'**$1**')
  s=s.replace(/<em[^>]*>([sS]*?)<\/em>/gi,'*$1*')
  s=s.replace(/<i[^>]*>([sS]*?)<\/i>/gi,'*$1*')
  s=s.replace(/<code[^>]*>([sS]*?)<\/code>/gi,BT+'$1'+BT)
  s=s.replace(/<a[^>]*href="([^"]*)"[^>]*>([sS]*?)<\/a>/gi,'[$2]($1)')
  s=s.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,'![$2]($1)')
  s=s.replace(/<blockquote[^>]*>([sS]*?)<\/blockquote>/gi,(_,t)=>t.split('\n').map((l:string)=>'> '+l.trim()).join('\n')+'\n\n')
  s=s.replace(/<hr[^>]*\/?>/gi,'---\n\n')
  s=s.replace(/<br[^>]*\/?>/gi,'\n')
  s=s.replace(/<ul[^>]*>([sS]*?)<\/ul>/gi,(_,t)=>t.replace(/<li[^>]*>([sS]*?)<\/li>/gi,(_:string,c:string)=>'- '+c.replace(/<[^>]+>/g,'').trim()+'\n')+'\n')
  s=s.replace(/<ol[^>]*>([sS]*?)<\/ol>/gi,(_,t)=>{let i=0;return t.replace(/<li[^>]*>([sS]*?)<\/li>/gi,(_:string,c:string)=>++i+'. '+c.replace(/<[^>]+>/g,'').trim()+'\n')+'\n'})
  s=s.replace(/<p[^>]*>([sS]*?)<\/p>/gi,'$1\n\n')
  s=s.replace(/<[^>]+>/g,'')
  s=s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ')
  s=s.replace(/\n{3,}/g,'\n\n').trim()
  return s
}
export default function HtmlToMarkdownPage() {
  const [input,setInput]=useState('<h1>Hello World</h1>\n<p>This is a <strong>bold</strong> and <em>italic</em> paragraph with a <a href="https://example.com">link</a>.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>\n<blockquote>A wise quote</blockquote>')
  const [copied,setCopied]=useState(false)
  const output=htmlToMd(input)
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">HTML Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={14}
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Markdown Output</label>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={14} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">HTML Preview</p>
          <div className="prose prose-sm max-w-none border border-gray-200 rounded-xl p-4 bg-white min-h-16"
            dangerouslySetInnerHTML={{__html:input}}/>
        </div>
      </div>
    </ToolLayout>
  )
}