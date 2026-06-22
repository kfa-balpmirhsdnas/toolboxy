'use client';
import { useState } from 'react';

function parseMarkdown(md: string): string {
  return md
    .replace(/^###### (.+)$/gm,'<h6 class="text-sm font-bold mt-3 mb-1">$1</h6>')
    .replace(/^##### (.+)$/gm,'<h5 class="text-base font-bold mt-3 mb-1">$1</h5>')
    .replace(/^#### (.+)$/gm,'<h4 class="text-lg font-bold mt-4 mb-1">$1</h4>')
    .replace(/^### (.+)$/gm,'<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm,'<h2 class="text-2xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm,'<h1 class="text-3xl font-bold mt-5 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/```([\s\S]+?)```/g,'<pre class="bg-gray-100 rounded p-3 overflow-x-auto my-3 text-sm"><code>$1</code></pre>')
    .replace(/`(.+?)`/g,'<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    .replace(/^> (.+)$/gm,'<blockquote class="border-l-4 border-gray-300 pl-4 my-2 text-gray-600 italic">$1</blockquote>')
    .replace(/^\* (.+)$/gm,'<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li class="ml-4 list-decimal">$1</li>')
    .replace(/---/g,'<hr class="my-4 border-gray-300"/>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
    .replace(/\n\n/g,'</p><p class="my-2">')
    .replace(/\n/g,'<br/>');
}

const SAMPLE = `# Welcome to Markdown Previewer

## Features
- **Bold text** and *italic text*
- \`inline code\`
- [Links](https://toolboxy.net)

### Code Block
\`\`\`
const hello = "world";
console.log(hello);
\`\`\`

> This is a blockquote

---

Paragraph with **emphasis** and line breaks.
`;

export default function MarkdownPreviewerPage() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState<'split'|'preview'>('split');

  const html = parseMarkdown(md);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown Previewer</h1>
          <p className="text-gray-600">Write Markdown on the left, see HTML preview on the right</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex gap-2 p-3 border-b border-gray-200 bg-gray-50">
            {(['split','preview'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${view===v?'bg-brand-600 text-white':'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
            <button onClick={()=>setMd('')}
              className="ml-auto px-4 py-1.5 rounded text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              Clear
            </button>
            <button onClick={()=>{const b=new Blob([md],{type:'text/markdown'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='document.md';a.click();URL.revokeObjectURL(u);}}
              className="px-4 py-1.5 rounded text-sm font-medium bg-brand-600 text-white hover:bg-brand-700">
              Download .md
            </button>
          </div>
          <div className="flex" style={{minHeight:'500px'}}>
            {(view==='split') && (
              <div className="flex-1 border-r border-gray-200">
                <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">MARKDOWN</div>
                <textarea
                  value={md}
                  onChange={e=>setMd(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm resize-none outline-none"
                  style={{minHeight:'460px'}}
                  placeholder="Type your Markdown here..."
                />
              </div>
            )}
            <div className={view==='split'?'flex-1':'w-full'}>
              <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">PREVIEW</div>
              <div
                className="p-4 prose max-w-none text-sm text-gray-800"
                dangerouslySetInnerHTML={{__html:'<p class="my-2">'+html+'</p>'}}
                style={{minHeight:'460px'}}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <strong>Supported:</strong> Headings (H1-H6), bold, italic, inline code, code blocks, blockquotes, lists, horizontal rules, links
        </div>
      </div>
    </div>
  );
}