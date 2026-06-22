'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-to-slug')!
function toSlug(text:string,opts:{lower:boolean;sep:string;trim:boolean}):string{
  let s=text.normalize('NFD').replace(/[̀-ͯ]/g,'')
  if(opts.lower)s=s.toLowerCase()
  s=s.replace(/[^a-zA-Z0-9s-_]/g,'').replace(/[s_]+/g,opts.sep)
  if(opts.trim)s=s.replace(new RegExp('^'+opts.sep+'+|'+opts.sep+'+$','g'),'')
  return s
}
export default function TextToSlugPage() {
  const [input,setInput]=useState('Hello World! This is my Blog Post Title')
  const [sep,setSep]=useState('-')
  const [lower,setLower]=useState(true)
  const [trim,setTrim]=useState(true)
  const [copied,setCopied]=useState(false)
  const slug=toSlug(input,{lower,sep,trim})
  const copy=()=>{navigator.clipboard.writeText(slug);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const SEPS=[{label:'Hyphen (-)',val:'-'},{label:'Underscore (_)',val:'_'},{label:'Dot (.)',val:'.'}]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Input text</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 resize-none"/></div>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Separator</p>
            <div className="flex gap-2">
              {SEPS.map(s=>(
                <button key={s.val} onClick={()=>setSep(s.val)}
                  className={'px-3 py-1.5 rounded border text-xs font-mono font-medium transition '+(sep===s.val?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{s.label}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)} className="rounded"/>Lowercase
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="checkbox" checked={trim} onChange={e=>setTrim(e.target.checked)} className="rounded"/>Trim
            </label>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Slug output</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm text-gray-800 break-all">{slug||'...'}</code>
            <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
        </div>
        <p className="text-xs text-gray-400">Length: {slug.length} chars</p>
      </div>
    </ToolLayout>
  )
}