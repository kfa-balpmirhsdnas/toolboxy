'use client'
import { useState } from 'react'

function stripHtml(html: string, options: { stripAll: boolean; keepLineBreaks: boolean; decode: boolean }): string {
  let result = html
  if (options.keepLineBreaks) {
    result = result.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(p|div|li|h[1-6]|tr|td|th)[^>]*>/gi, '\n')
  }
  result = result.replace(/<[^>]+>/g, '')
  if (options.decode) {
    result = result.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
  }
  result = result.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()
  return result
}

const SAMPLE = `<html>
<head><title>Sample Page</title></head>
<body>
  <h1>Welcome to <strong>ToolBoxy</strong></h1>
  <p>This is a <a href="https://toolboxy.net">paragraph</a> with <em>HTML tags</em>.</p>
  <ul>
    <li>Item one</li>
    <li>Item two &amp; three</li>
  </ul>
</body>
</html>`

export default function HtmlTagStripper() {
  const [input, setInput] = useState(SAMPLE)
  const [keepLineBreaks, setKeepLineBreaks] = useState(true)
  const [decode, setDecode] = useState(true)
  const [copied, setCopied] = useState(false)
  const output = stripHtml(input, { stripAll: true, keepLineBreaks, decode })
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML Tag Stripper</h1>
        <p className="text-gray-500 mb-8">Remove all HTML tags from text. Extract clean plain text from HTML.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={keepLineBreaks} onChange={e=>setKeepLineBreaks(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
            <span className="text-sm font-medium text-gray-700">Preserve line breaks (br, p, div)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={decode} onChange={e=>setDecode(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
            <span className="text-sm font-medium text-gray-700">Decode HTML entities (&amp;amp; → &amp;)</span>
          </label>
          <button onClick={()=>setInput(SAMPLE)} className="ml-auto text-sm text-gray-400 hover:text-gray-600">Load Example</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">HTML Input</span>
              <span className="text-xs text-gray-400">{input.length} chars</span>
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-5 font-mono text-sm resize-none focus:outline-none rounded-b-2xl" rows={18} placeholder="Paste HTML here..." spellCheck={false}/>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">Plain Text Output</span>
              <button onClick={copy} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium">{copied?'✓ Copied!':'Copy'}</button>
            </div>
            <pre className="flex-1 p-5 text-sm overflow-auto text-gray-700 whitespace-pre-wrap font-sans rounded-b-2xl">{output||<span className="text-gray-400">Output will appear here...</span>}</pre>
          </div>
        </div>
        {input && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[{l:'HTML chars',v:input.length},{l:'Plain chars',v:output.length},{l:'Reduction',v:Math.round((1-output.length/Math.max(input.length,1))*100)+'%'}].map(s=>(
              <div key={s.l} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{s.v}</div>
                <div className="text-xs text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}