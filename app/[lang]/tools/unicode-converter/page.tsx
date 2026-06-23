'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('unicode-converter')!
export default function UnicodeConverterPage() {
  const [input,setInput]=useState('Hello 😀 World 日本語')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [escapeType,setEscapeType]=useState<'js'|'html'|'css'|'hex'>('js')
  const encode=(text:string):string=>{
    return [...text].map(ch=>{
      const cp=ch.codePointAt(0)!
      if(cp<128&&escapeType!=='html')return ch
      if(escapeType==='js')return '\u'+cp.toString(16).toUpperCase().padStart(4,'0')
      if(escapeType==='html')return cp<128?ch:'&#'+cp+';'
      if(escapeType==='css')return '\\'+cp.toString(16).toUpperCase()+' '\n      return '%'+cp.toString(16).toUpperCase().padStart(2,'0')
    }).join('')
  }
  const decode=(text:string):string=>{
    try{
      return text.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCodePoint(parseInt(h,16)))
        .replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(parseInt(n)))
        .replace(/&#x([0-9a-fA-F]+);/g,(_,h)=>String.fromCodePoint(parseInt(h,16)))
    }catch{return text}
  }
  const output=mode==='encode'?encode(input):decode(input)
  const chars=[...input].map(ch=>({char:ch,cp:ch.codePointAt(0)!,hex:'U+'+ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4,'0'),name:''}))
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('encode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='encode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Text → Unicode</button>
          <button onClick={()=>setMode('decode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='decode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Unicode → Text</button>
        </div>
        {mode==='encode'&&(
          <div className="flex gap-2">
            {([['js','\\uXXXX'],['html','&#N;'],['css','\\XXXX'],['hex','%XX']] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setEscapeType(id)}
                className={'flex-1 py-1.5 rounded border text-xs font-mono font-medium transition '+(escapeType===id?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{label}</button>
            ))}
          </div>
        )}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Output</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
          <textarea readOnly value={output} rows={3} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Character breakdown</p>
          <div className="flex flex-wrap gap-2">
            {chars.slice(0,50).map((c,i)=>(
              <div key={i} className="text-center bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                <p className="text-lg">{c.char}</p>
                <p className="text-xs font-mono text-gray-500">{c.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}