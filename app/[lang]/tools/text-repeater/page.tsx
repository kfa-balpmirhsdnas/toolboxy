'use client'
import { useState } from 'react'

export default function TextRepeaterPage() {
  const [text,setText]=useState('Hello')
  const [count,setCount]=useState(5)
  const [separator,setSeparator]=useState('\n')
  const [customSep,setCustomSep]=useState('')
  const [prefix,setPrefix]=useState('')
  const [suffix,setSuffix]=useState('')
  const [numbered,setNumbered]=useState(false)
  const [copied,setCopied]=useState(false)

  const sep=separator==='custom'?customSep:separator==='\n'?'\n':separator==='\n\n'?'\n\n':separator
  const items=Array.from({length:Math.min(count,1000)},(_,i)=>`${prefix}${numbered?`${i+1}. `:''}${text}${suffix}`)
  const output=items.join(sep)

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  function download(){
    const blob=new Blob([output],{type:'text/plain'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='repeated-text.txt';a.click()
    URL.revokeObjectURL(url)
  }

  const SEPS=[['New line','\n'],['Double line','\n\n'],['Comma',', '],[' Space',' '],['Pipe',' | '],['Custom','custom']]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Repeater</h1>
        <p className="text-gray-500 mb-8">Repeat any text a specified number of times with custom separators and formatting</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text to repeat</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat count (max 1000)</label>
              <input type="number" value={count} min={1} max={1000} onChange={e=>setCount(Math.min(1000,Math.max(1,parseInt(e.target.value)||1)))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
              <select value={separator} onChange={e=>setSeparator(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none">
                {SEPS.map(([l,v])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          {separator==='custom'&&(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom separator</label>
              <input value={customSep} onChange={e=>setCustomSep(e.target.value)} placeholder="e.g., ---"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prefix (each line)</label>
              <input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="e.g., - "
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suffix (each line)</label>
              <input value={suffix} onChange={e=>setSuffix(e.target.value)} placeholder="e.g., ;"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={numbered} onChange={e=>setNumbered(e.target.checked)} className="rounded" />
            Add line numbers (1. 2. 3.)
          </label>
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Output ({items.length} repetitions · {output.length} characters)</span>
            <div className="flex gap-2">
              <button onClick={copy} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">{copied?'\u2713':'Copy'}</button>
              <button onClick={download} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">Download</button>
            </div>
          </div>
          <pre className="p-4 font-mono text-sm text-gray-700 max-h-64 overflow-auto whitespace-pre-wrap">{output.slice(0,2000)}{output.length>2000?'\n...(truncated for preview)':''}</pre>
        </div>
      </div>
    </main>
  )
}