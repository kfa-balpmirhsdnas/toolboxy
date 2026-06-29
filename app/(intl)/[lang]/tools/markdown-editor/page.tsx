'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('markdown-editor')!
function renderMarkdown(md: string): string {
  let h=md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^###### (.+)$/gm,'<h6>$1</h6>').replace(/^##### (.+)$/gm,'<h5>$1</h5>')
    .replace(/^#### (.+)$/gm,'<h4>$1</h4>').replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/~~(.+?)~~/g,'<del>$1</del>')
    .replace(/`(.+?)`/g,'<code class="bg-gray-100 text-pink-600 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" class="text-brand-600 underline" target="_blank">$1</a>')
    .replace(/^&gt; (.+)$/gm,'<blockquote class="border-l-4 border-gray-300 pl-4 text-gray-500 italic my-2">$1</blockquote>')
    .replace(/^[\*\-] (.+)$/gm,'<li>$1</li>').replace(/^\d+\. (.+)$/gm,'<li class="list-decimal">$1</li>')
    .replace(/```[\w]*\n?([\s\S]*?)```/g,'<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono my-3"><code>$1</code></pre>')
    .replace(/\n\n/g,'</p><p class="my-2">')
  return `<p class="my-2">${h}</p>`
}
const SAMPLE=`# Hello, Markdown!\n\nThis is a **live preview** editor.\n\n## Features\n\n- **Bold** and *italic* text\n- \`inline code\`\n- [Links](https://toolboxy.net)\n\n> Blockquotes look great too!\n`
export default function MarkdownEditorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [markdown, setMarkdown] = useState(SAMPLE)
  const [view, setView] = useState<'split'|'editor'|'preview'>('split')
  const [copied, setCopied] = useState(false)
  const wc=markdown.trim()?markdown.trim().split(/\s+/).length:0
  async function copy(){await navigator.clipboard.writeText(markdown);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(['split','editor','preview'] as const).map(v=>(<button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${view===v?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t('med_'+v)}</button>))}
          <span className="ml-auto text-xs text-gray-400">{t('med_stats',{w:wc,c:markdown.length})}</span>
          <button onClick={copy} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors">{copied ? <span className="inline-flex items-center gap-1"><ToolIcon name="check" className="w-3.5 h-3.5" />{t('ui_copied')}</span> : t('med_copymd')}</button>
          <button onClick={()=>setMarkdown('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">{t('ui_clear')}</button>
        </div>
        <div className={`gap-4 ${view==='split'?'flex':'block'}`} style={{minHeight:400}}>
          {(view==='split'||view==='editor')&&(<textarea value={markdown} onChange={e=>setMarkdown(e.target.value)} className={`border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 ${view==='split'?'flex-1':'w-full'}`} style={{minHeight:400}} placeholder={t('med_ph')} spellCheck={false} />)}
          {(view==='split'||view==='preview')&&(<div className={`border border-gray-200 rounded-xl px-5 py-4 overflow-auto prose prose-sm max-w-none ${view==='split'?'flex-1':'w-full'}`} style={{minHeight:400}} dangerouslySetInnerHTML={{__html:renderMarkdown(markdown)}} />)}
        </div>
        <p className="text-xs text-gray-400">{t('med_privacy')}</p>
      </div>
    </ToolLayout>
  )
}