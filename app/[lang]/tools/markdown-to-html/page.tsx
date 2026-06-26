'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('markdown-to-html')!
const BT = '`'
function mdToHtml(md:string):string{
  let s=md
  s=s.replace(/^######\s+(.+)$/gm,'<h6>$1</h6>')
  s=s.replace(/^#####\s+(.+)$/gm,'<h5>$1</h5>')
  s=s.replace(/^####\s+(.+)$/gm,'<h4>$1</h4>')
  s=s.replace(/^###\s+(.+)$/gm,'<h3>$1</h3>')
  s=s.replace(/^##\s+(.+)$/gm,'<h2>$1</h2>')
  s=s.replace(/^#\s+(.+)$/gm,'<h1>$1</h1>')
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>')
  s=s.replace(/~~(.+?)~~/g,'<del>$1</del>')
  s=s.replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>')
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>')
  s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1"/>')
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
  s=s.replace(/^---+$/gm,'<hr/>')
  s=s.replace(/^>\s+(.+)$/gm,'<blockquote>$1</blockquote>')
  s=s.replace(/^\d+\.\s+(.+)$/gm,'<li class="ol-item">$1</li>')
  s=s.replace(/^[-*]\s+(.+)$/gm,'<li>$1</li>')
  s=s.replace(/(<li class="ol-item">.*<\/li>\n?)+/g,'<ol>$&</ol>')
  s=s.replace(/(<li>.*<\/li>\n?)+/g,(m)=>{if(m.includes('class="ol-item"'))return m;return '<ul>'+m+'</ul>'})
  s=s.replace(/^(?!<[houblpid]).+$/gm,'<p>$&</p>')
  s=s.replace(/\n{2,}/g,'\n')
  return s.trim()
}
export default function MarkdownToHtmlPage() {
  const t = useTranslations('toolui')
  const [md,setMd]=useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n## Features\n\n- Item one\n- Item two\n- Item three\n\n> A blockquote\n\n[Visit Google](https://google.com)\n\n```\nconst x = 1;\n```')
  const [view,setView]=useState<'html'|'preview'>('html')
  const [copied,setCopied]=useState(false)
  const output=mdToHtml(md)
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('mdp_md')}</label>
            <textarea value={md} onChange={e=>setMd(e.target.value)} rows={16}
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/></div>
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex rounded overflow-hidden border border-gray-300">
                <button onClick={()=>setView('html')} className={'px-3 py-1 text-xs font-medium transition '+(view==='html'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>HTML</button>
                <button onClick={()=>setView('preview')} className={'px-3 py-1 text-xs font-medium transition '+(view==='preview'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('htg_preview')}</button>
              </div>
              {view==='html'&&<button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?t('ui_copied'):t('ui_copy')}</button>}
            </div>
            {view==='html'?(
              <textarea readOnly value={output} rows={16} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
            ):(
              <div className="prose prose-sm max-w-none border border-gray-200 rounded-xl p-4 bg-white h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{__html:output}}/>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}