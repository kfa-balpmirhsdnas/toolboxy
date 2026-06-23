'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [input,setInput]=useState('')
  const [caseSensitive,setCaseSensitive]=useState(true)
  const [trimLines,setTrimLines]=useState(false)
  const lines=input.split('
')
  const seen=new Set<string>()
  const result=lines.filter(l=>{const k=(trimLines?l.trim():l);const key=caseSensitive?k:k.toLowerCase();if(seen.has(key))return false;seen.add(key);return true})
  const removed=lines.length-result.length
  const tool=TOOLS.find(t=>t.slug==='duplicate-line-remover')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} className="rounded"/>Case sensitive</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={trimLines} onChange={e=>setTrimLines(e.target.checked)} className="rounded"/>Trim whitespace</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Input ({lines.length} lines)</p>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={12} placeholder="Paste lines here..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Output ({result.length} lines, -{removed} removed)</p>
            <textarea value={result.join('
')} readOnly rows={12} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono resize-none"/></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>navigator.clipboard?.writeText(result.join('
'))} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy Output</button>
          <button onClick={()=>setInput('')} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Clear</button>
        </div>
      </div>
    </ToolLayout>
  )
}