'use client'
import { useState } from 'react'

function toSlug(text:string, sep:string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, sep)
}

export default function TextToSlugPage() {
  const [input, setInput] = useState('')
  const [sep, setSep] = useState('-')
  const [copied, setCopied] = useState(false)

  const slug = toSlug(input, sep)

  function copy(){navigator.clipboard.writeText(slug);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  const examples=['Hello World', 'My Blog Post Title!', 'Cafe\u00E9 au lait', 'The Quick Brown Fox & more...']

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text to Slug</h1>
        <p className="text-gray-500 mb-8">Convert any text to a clean, SEO-friendly URL slug</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. My Blog Post Title!"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Separator:</span>
            {(['-','_','.'] as const).map(s=>(
              <button key={s} onClick={()=>setSep(s)}
                className={'px-3 py-1 rounded-lg font-mono font-bold text-sm transition-colors '+(sep===s?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                {s}
              </button>
            ))}
          </div>
          {slug&&(
            <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <code className="text-green-400 font-mono text-sm break-all">{slug}</code>
              <button onClick={copy} className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shrink-0">{copied?'\u2713':'Copy'}</button>
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Examples</h2>
          <div className="space-y-2">
            {examples.map(ex=>(
              <button key={ex} onClick={()=>setInput(ex)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 text-left">
                <span className="text-sm text-gray-600 flex-1">{ex}</span>
                <span className="text-gray-400">\u2192</span>
                <code className="text-xs text-brand-600 font-mono">{toSlug(ex,sep)}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}