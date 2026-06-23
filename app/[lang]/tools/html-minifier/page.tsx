'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function minify(h){
  return h.replace(/<!--[\s\S]*?-->/g,'').replace(/\s+/g,' ').replace(/>\s+</g,'><').replace(/\s+>/g,'>').replace(/<\s+/g,'<').trim()
}
export default function Page(){
  const [input,setInput]=useState('<html>\n  <head>\n    <title>Page</title>\n  </head>\n  <body>\n    <!-- comment -->\n    <p>Hello  World</p>\n  </body>\n</html>')
  const output=minify(input)
  const pct=input.length>0?Math.round((1-output.length/input.length)*100):0
  const tool=TOOLS.find(t=>t.slug==='html-minifier')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">HTML Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div className="flex justify-between text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
          <span>{input.length} → {output.length} chars</span><span className="text-green-600 font-semibold">{pct}% saved</span></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Minified</label>
          <textarea value={output} readOnly rows={4} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
        <button onClick={()=>navigator.clipboard?.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
      </div>
    </ToolLayout>
  )
}