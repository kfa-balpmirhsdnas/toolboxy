'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-case-converter')!
function toCase(t:string,mode:string):string{
  const words=t.split(/[s_-]+/)
  switch(mode){
    case 'upper':return t.toUpperCase()
    case 'lower':return t.toLowerCase()
    case 'title':return t.toLowerCase().replace(/(?:^|[s-_])(S)/g,c=>c.toUpperCase())
    case 'sentence':return t.toLowerCase().replace(/(^s*[a-z])|([.!?]s+[a-z])/g,c=>c.toUpperCase())
    case 'camel':return words.map((w,i)=>i===0?w.toLowerCase():w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join('')
    case 'pascal':return words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join('')
    case 'snake':return words.map(w=>w.toLowerCase()).join('_')
    case 'kebab':return words.map(w=>w.toLowerCase()).join('-')
    case 'constant':return words.map(w=>w.toUpperCase()).join('_')
    case 'dot':return words.map(w=>w.toLowerCase()).join('.')
    case 'path':return words.map(w=>w.toLowerCase()).join('/')
    case 'alternate':return t.split('').map((c,i)=>i%2===0?c.toLowerCase():c.toUpperCase()).join('')
    case 'inverse':return t.split('').map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join('')
    default:return t
  }
}
const MODES=[{v:'upper',l:'UPPERCASE'},{v:'lower',l:'lowercase'},{v:'title',l:'Title Case'},{v:'sentence',l:'Sentence case'},{v:'camel',l:'camelCase'},{v:'pascal',l:'PascalCase'},{v:'snake',l:'snake_case'},{v:'kebab',l:'kebab-case'},{v:'constant',l:'CONSTANT_CASE'},{v:'dot',l:'dot.case'},{v:'path',l:'path/case'},{v:'alternate',l:'aLtErNaTe'},{v:'inverse',l:'iNVERSE'}]
export default function TextCaseConverterPage() {
  const [input,setInput]=useState('the quick brown fox jumps over the lazy dog')
  const [copied,setCopied]=useState('')
  const copy=(v:string,k:string)=>{navigator.clipboard.writeText(v);setCopied(k);setTimeout(()=>setCopied(''),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Input text</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-400"
            placeholder="Enter your text here..."/></div>
        <div className="grid grid-cols-1 gap-2">
          {MODES.map(m=>{
            const out=toCase(input,m.v)
            return(
              <div key={m.v} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition">
                <span className="w-28 text-xs font-medium text-gray-500 flex-shrink-0">{m.l}</span>
                <span className="flex-1 text-sm font-mono text-gray-800 truncate">{out}</span>
                <button onClick={()=>copy(out,m.v)} className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700 px-2">
                  {copied===m.v?'✓':'Copy'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}