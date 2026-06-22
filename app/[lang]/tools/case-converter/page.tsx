'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function words(s:string):string[]{return s.trim().replace(/([A-Z])/g,' $1').replace(/[_\-]+/g,' ').split(/\s+/).filter(Boolean)}

const CASES=[
  {id:'lower',label:'lowercase',fn:(s:string)=>words(s).join(' ').toLowerCase()},
  {id:'upper',label:'UPPERCASE',fn:(s:string)=>words(s).join(' ').toUpperCase()},
  {id:'title',label:'Title Case',fn:(s:string)=>words(s).map(w=>w[0].toUpperCase()+w.slice(1).toLowerCase()).join(' ')},
  {id:'sentence',label:'Sentence case',fn:(s:string)=>{const w=words(s).join(' ').toLowerCase();return w?w[0].toUpperCase()+w.slice(1):''}},
  {id:'camel',label:'camelCase',fn:(s:string)=>words(s).map((w,i)=>i===0?w.toLowerCase():w[0].toUpperCase()+w.slice(1).toLowerCase()).join('')},
  {id:'pascal',label:'PascalCase',fn:(s:string)=>words(s).map(w=>w[0].toUpperCase()+w.slice(1).toLowerCase()).join('')},
  {id:'snake',label:'snake_case',fn:(s:string)=>words(s).join('_').toLowerCase()},
  {id:'screaming',label:'SCREAMING_SNAKE',fn:(s:string)=>words(s).join('_').toUpperCase()},
  {id:'kebab',label:'kebab-case',fn:(s:string)=>words(s).join('-').toLowerCase()},
  {id:'dot',label:'dot.case',fn:(s:string)=>words(s).join('.').toLowerCase()},
]


const tool = getToolBySlug('case-converter')!

export default function CaseConverterPage() {
  const [input,setInput]=useState('')
  const [copied,setCopied]=useState('')

  function copy(val:string,id:string){navigator.clipboard.writeText(val);setCopied(id);setTimeout(()=>setCopied(''),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Converter</h1>
        <p className="text-gray-500 mb-8">Convert text to camelCase, PascalCase, snake_case, kebab-case, Title Case, and more</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
            placeholder="Type or paste your text here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        </div>
        <div className="mt-4 space-y-2">
          {CASES.map(({id,label,fn})=>{
            const val=input?fn(input):''
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="w-36 shrink-0">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{label}</span>
                </div>
                <div className="flex-1 font-mono text-sm text-gray-800 truncate">{val||<span className="text-gray-300">result appears here</span>}</div>
                <button onClick={()=>copy(val,id)} disabled={!val}
                  className={'shrink-0 text-xs px-3 py-1 rounded-lg transition-colors '+(copied===id?'bg-brand-500 text-white':'bg-gray-100 hover:bg-gray-200 text-gray-600')}>
                  {copied===id?'\u2713':'Copy'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}