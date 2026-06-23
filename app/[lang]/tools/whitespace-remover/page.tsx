'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('whitespace-remover')!
type Mode='all'|'leading'|'trailing'|'both'|'extra'|'lines'
export default function WhitespaceRemoverPage() {
  const [input,setInput]=useState('  Hello   World  \n
  This is   a test.  


Line with   multiple   spaces.  ')\n  const [mode,setMode]=useState<Mode>('both')
  const [newlines,setNewlines]=useState(false)
  const [copied,setCopied]=useState(false)
  const process=(t:string):string=>{
    let s=t
    const lines=s.split('\n')\n    const processed=lines.map(l=>{\n      if(mode==='all')return l.replace(/s/g,'')\n      if(mode==='leading')return l.trimStart()\n      if(mode==='trailing')return l.trimEnd()\n      if(mode==='both')return l.trim()\n      if(mode==='extra')return l.trim().replace(/s{2,}/g,' ')\n      return l\n    })\n    s=processed.join('
')\n    if(mode==='lines'||newlines)s=s.replace(/
{3,}/g,'\n
').replace(/^\n+|
+$/g,'')
    return s
  }
  const result=process(input)
  const origLen=input.length,resLen=result.length,saved=origLen-resLen
  const copy=()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const MODES:Array<{v:Mode;l:string;desc:string}>=[
    {v:'both',l:'Trim',desc:'Remove leading & trailing spaces per line'},
    {v:'leading',l:'Leading',desc:'Remove leading spaces only'},
    {v:'trailing',l:'Trailing',desc:'Remove trailing spaces only'},
    {v:'extra',l:'Extra spaces',desc:'Collapse multiple spaces to one'},
    {v:'all',l:'All spaces',desc:'Remove all whitespace characters'},
    {v:'lines',l:'Empty lines',desc:'Remove consecutive empty lines'},
  ]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(m=>(
            <button key={m.v} onClick={()=>setMode(m.v)}
              className={'px-3 py-2 rounded-xl text-xs font-medium border text-left transition '+(mode===m.v?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600 hover:bg-gray-50')}>
              <p className="font-semibold">{m.l}</p>
              <p className={'text-xs mt-0.5 '+(mode===m.v?'opacity-80':'text-gray-400')}>{m.desc}</p>
            </button>
          ))}
        </div>
        {mode!=='lines'&&<label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
          <input type="checkbox" checked={newlines} onChange={e=>setNewlines(e.target.checked)} className="rounded"/>
          Also clean consecutive empty lines
        </label>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Result</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-sm h-48 overflow-auto whitespace-pre">{result}</div>
          </div>
        </div>
        <div className="flex gap-3 text-sm text-center">
          {[['Before',origLen+' chars'],['After',resLen+' chars'],['Saved',saved+' chars']].map(([l,v])=>(
            <div key={l} className="flex-1 bg-gray-50 rounded-xl py-2.5">
              <p className="font-bold text-gray-800">{v}</p><p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}