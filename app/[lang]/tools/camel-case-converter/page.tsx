'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('camel-case-converter')!

function tokenize(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g,'$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2')
    .replace(/[-_./\\]+/g,' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w=>w.toLowerCase())
}

const CONVERSIONS = [
  { id:'camel',   label:'camelCase',       fn:(ts:string[])=>ts.map((t,i)=>i===0?t:t[0].toUpperCase()+t.slice(1)).join('') },
  { id:'pascal',  label:'PascalCase',      fn:(ts:string[])=>ts.map(t=>t[0].toUpperCase()+t.slice(1)).join('') },
  { id:'snake',   label:'snake_case',      fn:(ts:string[])=>ts.join('_') },
  { id:'screaming',label:'SCREAMING_SNAKE',fn:(ts:string[])=>ts.join('_').toUpperCase() },
  { id:'kebab',   label:'kebab-case',      fn:(ts:string[])=>ts.join('-') },
  { id:'dot',     label:'dot.case',        fn:(ts:string[])=>ts.join('.') },
  { id:'path',    label:'path/case',       fn:(ts:string[])=>ts.join('/') },
  { id:'title',   label:'Title Case',      fn:(ts:string[])=>ts.map(t=>t[0].toUpperCase()+t.slice(1)).join(' ') },
  { id:'sentence',label:'Sentence case',   fn:(ts:string[])=>ts.map((t,i)=>i===0?t[0].toUpperCase()+t.slice(1):t).join(' ') },
  { id:'lower',   label:'lower case',      fn:(ts:string[])=>ts.join(' ') },
  { id:'upper',   label:'UPPER CASE',      fn:(ts:string[])=>ts.join(' ').toUpperCase() },
  { id:'cobol',   label:'COBOL-CASE',      fn:(ts:string[])=>ts.join('-').toUpperCase() },
]

export default function CamelCaseConverterPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('helloWorldThisIsATest')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('camel-case-converter'); tracked.current = true } }

  const tokens = tokenize(input)
  const results = CONVERSIONS.map(c => ({ ...c, output: tokens.length ? c.fn(tokens) : '' }))

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('camel-case-converter')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('cam_input')}</label>
          <input value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="myVariableName or my-variable-name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        {tokens.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {results.map(r=>(
              <div key={r.id} onClick={()=>copy(r.output,r.id)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors group">
                <p className="text-xs text-gray-400 mb-0.5">{r.label}</p>
                <p className="text-sm font-mono text-gray-800 truncate">{r.output}</p>
                <p className="text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">{copied===r.id?'\u2713':t('ui_click_copy')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
