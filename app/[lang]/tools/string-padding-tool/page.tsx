'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('string-padding-tool')!
const PAD_CHARS=[{label:'Space',val:' '},{label:'Zero',val:'0'},{label:'Dot',val:'.'},{label:'Dash',val:'-'},{label:'Star',val:'*'},{label:'Hash',val:'#'}]
export default function StringPaddingToolPage() {
  const [lines,setLines]=useState('Hello\nHi
Goodbye
World')\n  const [mode,setMode]=useState<'start'|'end'|'both'>('end')
  const [padChar,setPadChar]=useState(' ')
  const [targetLen,setTargetLen]=useState(10)
  const [copied,setCopied]=useState(false)
  const pc=padChar.charAt(0)||' '
  const processedLines=lines.split('\n').map(l=>{\n    const n=Math.max(0,targetLen-l.length)\n    if(mode==='start')return pc.repeat(n)+l\n    if(mode==='end')return l+pc.repeat(n)\n    const half=Math.floor(n/2)\n    return pc.repeat(half)+l+pc.repeat(n-half)\n  })\n  const output=processedLines.join('
')\n  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Input text (one per line)</label>
            <textarea value={lines} onChange={e=>setLines(e.target.value)} rows={6} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
            <div className="relative">
              <textarea readOnly value={output} rows={6} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/>
              <button onClick={copy} className="absolute top-1 right-1 text-xs text-blue-600 hover:underline bg-gray-50 px-1">{copied?'Copied!':'Copy'}</button>
            </div></div>
        </div>
        <div className="flex flex-wrap gap-4 items-start">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Direction</p>
            <div className="flex rounded overflow-hidden border border-gray-300">
              {([['start','Pad Start'],['end','Pad End'],['both','Center']] as const).map(([id,label])=>(
                <button key={id} onClick={()=>setMode(id)}
                  className={'px-3 py-1.5 text-xs font-medium transition '+(mode===id?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{label}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Target length: {targetLen}</label>
            <input type="number" min="1" max="200" value={targetLen} onChange={e=>setTargetLen(Math.max(1,Number(e.target.value)))} className="w-20 rounded border border-gray-300 px-2 py-1.5 text-center text-sm"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Pad character</label>
            <div className="flex gap-1.5 flex-wrap">
              {PAD_CHARS.map(p=>(
                <button key={p.label} onClick={()=>setPadChar(p.val)}
                  className={'w-8 h-8 rounded border font-mono text-sm transition '+(padChar===p.val?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{p.val}</button>
              ))}
              <input value={padChar} onChange={e=>setPadChar(e.target.value.slice(-1)||' ')} maxLength={1} className="w-8 h-8 rounded border border-gray-300 text-center font-mono text-sm"/>
            </div></div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
          <span className="font-mono">
            {mode==='start'?'str.padStart('+targetLen+', "'+pc+'")'
             :mode==='end'?'str.padEnd('+targetLen+', "'+pc+'")'
             :'// custom center padding'}
          </span>
        </div>
      </div>
    </ToolLayout>
  )
}