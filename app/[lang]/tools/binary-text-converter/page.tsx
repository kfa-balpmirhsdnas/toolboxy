'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function textToBinary(text:string):string{
  return Array.from(text).map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')
}
function binaryToText(bin:string):string{
  try{
    return bin.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join('')
  }catch{return 'Invalid binary input'}
}
function textToHex(text:string):string{
  return Array.from(text).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join(' ')
}
function hexToText(hex:string):string{
  try{return hex.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join('')}catch{return 'Invalid hex input'}
}


const tool = getToolBySlug('binary-text-converter')!

export default function BinaryTextConverterPage() {
  const [mode,setMode]=useState<'to'|'from'>('to')
  const [format,setFormat]=useState<'binary'|'hex'>('binary')
  const [input,setInput]=useState('Hello World')
  const [copied,setCopied]=useState(false)

  const output=mode==='to'
    ?(format==='binary'?textToBinary(input):textToHex(input))
    :(format==='binary'?binaryToText(input):hexToText(input))

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Binary Text Converter</h1>
        <p className="text-gray-500 mb-8">Convert text to binary or hexadecimal representation and decode it back</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex gap-1 flex-1">
              {(['to','from'] as const).map(m=>(
                <button key={m} onClick={()=>setMode(m)} className={'flex-1 py-2 rounded-lg font-medium text-sm transition-colors '+(mode===m?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>
                  {m==='to'?'Text \u2192 Code':'Code \u2192 Text'}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['binary','hex'] as const).map(f=>(
                <button key={f} onClick={()=>setFormat(f)} className={'px-3 py-2 rounded-lg font-medium text-sm transition-colors capitalize '+(format===f?'bg-purple-500 text-white':'bg-gray-100 text-gray-700')}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode==='to'?'Text':''+format.charAt(0).toUpperCase()+format.slice(1)+' Code'}
            </label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
              placeholder={mode==='to'?'Type text here...':format==='binary'?'e.g. 01001000 01100101 01101100':'e.g. 48 65 6C 6C 6F'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                {mode==='from'?'Text':format.charAt(0).toUpperCase()+format.slice(1)+' Code'}
              </label>
              <button onClick={copy} className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <div className="bg-gray-900 rounded-xl px-4 py-3 font-mono text-green-400 text-sm break-all min-h-[80px]">{output}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}