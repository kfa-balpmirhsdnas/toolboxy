'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function mdToHtml(md:string):string{
  return md
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/^(?!<[h|u|b|l|a])/gm,'')
}

const SAMPLE=`# Hello, Markdown!

This is a **bold** and *italic* text example.

## Features

- Headings (H1, H2, H3)
- **Bold** and *italic*
- \`inline code\`
- Lists and blockquotes

> This is a blockquote

[Visit toolboxy](https://toolboxy.net)
`

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='markdown-previewer')
  const [md,setMd]=useState(SAMPLE)

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div>
          <label className="block text-sm font-medium mb-1">Markdown</label>
          <textarea value={md} onChange={e=>setMd(e.target.value)}
            className="w-full h-96 p-3 border rounded font-mono text-sm resize-y"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preview</label>
          <div
            className="h-96 p-3 border rounded overflow-auto prose max-w-none"
            dangerouslySetInnerHTML={{__html:'<p>'+mdToHtml(md)+'</p>'}}
          />
        </div>
      </div>
    </ToolLayout>
  )
}
