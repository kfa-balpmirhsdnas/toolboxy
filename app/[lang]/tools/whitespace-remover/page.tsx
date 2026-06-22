'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('whitespace-remover')!

type Option = { id:string; label:string; fn:(s:string)=>string }
const OPTIONS: Option[] = [
  { id:'trim',     label:'Trim each line',       fn:s=>s.split('\n').map(l=>l.trim()).join('\n') },
  { id:'leading',  label:'Remove leading spaces', fn:s=>s.split('\n').map(l=>l.replace(/^\s+/,'')).join('\n') },
  { id:'trailing', label:'Remove trailing spaces',fn:s=>s.split('\n').map(l=>l.replace(/\s+$/,'')).join('\n') },
  { id:'multiple', label:'Collapse multiple spaces',fn:s=>s.replace(/ {2,}/g,' ') },
  { id:'blanklines',label:'Remove blank lines',   fn:s=>s.split('\n').filter(l=>l.trim()).join('\n') },
  { id:'tabs',     label:'Tabs to spaces',         fn:s=>s.replace(/\t/g,'    ') },
  { id:'all',      label:'Strip all whitespace',   fn:s=>s.replace(/\s+/g,'') },
  { id:'normalize',label:'Normalize (trim + collapse)', fn:s=>s.split('\n').map(l=>l.trim().replace(/ {2,}/g,' ')).filter(l=>l).join('\n') },
]

export default function WhitespaceRemoverPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('  Hello    World  \n  \n  This   has   extra    spaces  \n\tAnd a tab here  ')
  const [active, setActive] = useState<string[]>(['trim','multiple'])
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('whitespace-remover'); tracked.current = true } }

  function toggle(id: string) {
    setActive(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])
    track()
  }

  const output = active.reduce((s, id) => {
    const opt = OPTIONS.find(o=>o.id===id)
    return opt ? opt.fn(s) : s
  }, input)

  const removed = input.replace(/\r\n?/g,'\n').length - output.replace(/\r\n?/g,'\n').length

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('whitespace-remover')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={5} placeholder="Paste text..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map(opt=>(
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded-lg hover:bg-gray-50">
              <input type="checkbox" checked={active.includes(opt.id)} onChange={()=>toggle(opt.id)} className="accent-brand-600" />
              {opt.label}
            </label>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Output <span className="text-gray-400">({removed > 0 ? '-'+removed+' chars' : 'no change'})</span></label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono whitespace-pre-wrap min-h-12 max-h-48 overflow-y-auto">{output}</div>
        </div>
      </div>
    </ToolLayout>
  )
}
