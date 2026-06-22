'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('html-entity-converter')!

const NAMED: Record<string,string> = {
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;',
  '©':'&copy;','®':'&reg;','™':'&trade;','°':'&deg;','±':'&plusmn;',
  '×':'&times;','÷':'&divide;','€':'&euro;','£':'&pound;','¥':'&yen;',
  '§':'&sect;','¶':'&para;','†':'&dagger;','‡':'&Dagger;','•':'&bull;',
  '…':'&hellip;','—':'&mdash;','–':'&endash;',' ':'&nbsp;',
}
const NAMED_REV = Object.fromEntries(Object.entries(NAMED).map(([k,v])=>[v,k]))

function encodeNamed(s: string): string {
  return s.replace(/[&<>"'©®™°±×÷€£¥§¶†‡•…—– ]/g, c=>NAMED[c]||c)
}
function encodeNumeric(s: string): string {
  return s.replace(/[&<>"'©®™°±×÷€£¥§¶†‡•…—– ]/g, c=>'&#'+c.charCodeAt(0)+';')
}
function encodeAll(s: string): string {
  return Array.from(s).map(c=>c.charCodeAt(0)>127?'&#'+c.charCodeAt(0)+';':c).join('')
}
function decode(s: string): string {
  return s
    .replace(/&[a-zA-Z]+;/g, e=>NAMED_REV[e]??e)
    .replace(/&#(\d+);/g, (_,n)=>String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_,h)=>String.fromCharCode(parseInt(h,16)))
}

const MODES = [
  { id:'named',   label:'Named entities', fn:encodeNamed },
  { id:'numeric', label:'Numeric entities', fn:encodeNumeric },
  { id:'all',     label:'Encode all non-ASCII', fn:encodeAll },
  { id:'decode',  label:'Decode', fn:decode },
]

export default function HtmlEntityConverterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('<div class="test">Hello & world © 2024 — "quotes" €100</div>')
  const [mode, setMode] = useState('named')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('html-entity-converter'); tracked.current = true } }

  const selectedMode = MODES.find(m=>m.id===mode)!
  const output = input ? selectedMode.fn(input) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('html-entity-converter')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (mode===m.id?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m.label}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        </div>
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Output</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono resize-none" />
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
          {Object.entries(NAMED).slice(0,12).map(([char,entity])=>(
            <div key={char} className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <div className="text-base">{char}</div>
              <div className="text-xs text-gray-500 font-mono truncate">{entity}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
