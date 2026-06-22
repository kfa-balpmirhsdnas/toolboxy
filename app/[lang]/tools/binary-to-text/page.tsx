'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('binary-to-text')!
function textToBin(t:string):string{return[...t].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')}
function binToText(b:string):string{
  try{
    const clean=b.replace(/s+/g,' ').trim()
    const bytes=clean.split(' ').filter(Boolean)
    if(bytes.some(b=>!/^[01]+$/.test(b)))return 'Invalid binary'
    return bytes.map(b=>String.fromCharCode(parseInt(b,2))).join('')
  }catch{return 'Invalid binary'}
}
function textToHex(t:string):string{return[...t].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ')}
function hexToText(h:string):string{
  try{return h.replace(/s+/g,'').match(/.{2}/g)?.map(b=>String.fromCharCode(parseInt(b,16))).join('')||''}catch{return 'Invalid hex'}
}
function textToOctal(t:string):string{return[...t].map(c=>c.charCodeAt(0).toString(8).padStart(3,'0')).join(' ')}
export default function BinaryToTextPage() {
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [encoding,setEncoding]=useState<'binary'|'hex'|'octal'>('binary')
  const [input,setInput]=useState('Hello World')
  const [copied,setCopied]=useState(false)
  const convert=():string=>{
    if(mode==='encode'){
      if(encoding==='binary')return textToBin(input)
      if(encoding==='hex')return textToHex(input)
      return textToOctal(input)
    }else{
      if(encoding==='binary')return binToText(input)
      if(encoding==='hex')return hexToText(input)
      return 'Octal decode: '+input.split(' ').map(o=>String.fromCharCode(parseInt(o,8))).join('')
    }
  }
  const output=convert()
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('encode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='encode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Text to Binary</button>
          <button onClick={()=>setMode('decode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='decode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Binary to Text</button>
        </div>
        <div className="flex gap-2">
          {([['binary','Binary (base 2)'],['hex','Hex (base 16)'],['octal','Octal (base 8)']] as const).map(([id,label])=>(
            <button key={id} onClick={()=>setEncoding(id)}
              className={'flex-1 py-1.5 rounded border text-xs font-medium transition '+(encoding===id?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{label}</button>
          ))}
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
            placeholder={mode==='encode'?'Type text...':encoding==='binary'?'01001000 01100101 01101100...':encoding==='hex'?'48 65 6c 6c 6f...':'110 145 154...'}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Output</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
          <textarea readOnly value={output} rows={4} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none break-all"/>
        </div>
        {mode==='encode'&&input&&(
          <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
            {[...input].slice(0,8).map((c,i)=>(
              <span key={i} className="mr-3 font-mono">
                <span className="text-gray-600">{c}</span>
                <span className="text-gray-400"> = </span>
                <span className="text-blue-500">{c.charCodeAt(0).toString(2).padStart(8,'0')}</span>
              </span>
            ))}
            {input.length>8&&<span className="text-gray-400">+{input.length-8} more</span>}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}