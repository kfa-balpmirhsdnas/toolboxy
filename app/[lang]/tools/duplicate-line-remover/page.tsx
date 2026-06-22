'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('duplicate-line-remover')!

export default function DuplicateLineRemoverPage() {
  const [input, setInput] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [keepOrder, setKeepOrder] = useState(true)
  const [trimLines, setTrimLines] = useState(true)
  const [copied, setCopied] = useState(false)

  const lines = input.split('\n').map(l=>trimLines?l.trim():l)
  const nonEmpty = lines.filter(l=>l!=='')
  const seen = new Set<string>()
  const unique = nonEmpty.filter(l=>{ const k=caseSensitive?l:l.toLowerCase(); if(seen.has(k))return false; seen.add(k); return true })
  const output = unique.join('\n')
  const removed = nonEmpty.length - unique.length

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Duplicate Line Remover</h1>
        <p className="text-gray-500 mb-8">Remove duplicate lines from any text while preserving order</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
              placeholder="Paste lines here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} className="rounded" /><span className="text-sm">Case sensitive</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={trimLines} onChange={e=>setTrimLines(e.target.checked)} className="rounded" /><span className="text-sm">Trim whitespace</span></label>
          </div>
          {nonEmpty.length>0&&(
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Original: <b>{nonEmpty.length}</b> lines</span>
              <span className="text-green-600">Unique: <b>{unique.length}</b> lines</span>
              {removed>0&&<span className="text-red-500">Removed: <b>{removed}</b> duplicates</span>}
            </div>
          )}
        </div>
        {unique.length>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">Result</span>
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <textarea value={output} readOnly rows={10} className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm bg-gray-50 resize-none" />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}