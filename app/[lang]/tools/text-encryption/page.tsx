'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-encryption')!
function caesarEnc(text:string,shift:number):string{
  return text.replace(/[a-zA-Z]/g,c=>{const base=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-base+shift+26)%26+base)})
}
function rot13(text:string):string{return caesarEnc(text,13)}
function xorEnc(text:string,key:string):string{
  if(!key)return text
  return text.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^key.charCodeAt(i%key.length))).join('')
}
function b64Enc(text:string):string{try{return btoa(unescape(encodeURIComponent(text)))}catch{return 'Encoding error'}}
function b64Dec(text:string):string{try{return decodeURIComponent(escape(atob(text)))}catch{return 'Invalid base64'}}
function atbashEnc(text:string):string{
  return text.replace(/[a-zA-Z]/g,c=>{const u=c<='Z';const base=u?90:122;return String.fromCharCode(base-(c.charCodeAt(0)-(u?65:97)))} )
}
type Method='caesar'|'rot13'|'atbash'|'xor'|'base64'
export default function TextEncryptionPage() {
  const [method,setMethod]=useState<Method>('caesar')
  const [input,setInput]=useState('Hello World')
  const [mode,setMode]=useState<'encrypt'|'decrypt'>('encrypt')
  const [shift,setShift]=useState(3)
  const [key,setKey]=useState('secret')
  const [copied,setCopied]=useState(false)
  const output=():string=>{
    if(method==='caesar')return caesarEnc(input,mode==='encrypt'?shift:26-shift)
    if(method==='rot13')return rot13(input)
    if(method==='atbash')return atbashEnc(input)
    if(method==='xor'){
      const r=xorEnc(input,key)
      return mode==='encrypt'?b64Enc(r):xorEnc(b64Dec(input),key)
    }
    return mode==='encrypt'?b64Enc(input):b64Dec(input)
  }
  const copy=()=>{navigator.clipboard.writeText(output());setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const METHODS=[
    {id:'caesar' as Method,label:'Caesar Cipher',desc:'Shift alphabet by N'},
    {id:'rot13' as Method,label:'ROT13',desc:'Shift by 13 (self-inverse)'},
    {id:'atbash' as Method,label:'Atbash',desc:'Reverse alphabet (self-inverse)'},
    {id:'xor' as Method,label:'XOR',desc:'XOR with key (base64 output)'},
    {id:'base64' as Method,label:'Base64',desc:'Encode/decode base64'},
  ]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('encrypt')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='encrypt'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Encrypt</button>
          <button onClick={()=>setMode('decrypt')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='decrypt'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Decrypt</button>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {METHODS.map(m=>(
            <button key={m.id} onClick={()=>setMethod(m.id)}
              className={'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition '+(method===m.id?'bg-blue-50 border-blue-300':'border-gray-200 hover:bg-gray-50')}>
              <div className={'w-4 h-4 rounded-full border-2 flex-shrink-0 '+(method===m.id?'bg-blue-600 border-blue-600':'border-gray-400')}/>
              <div>
                <span className="text-sm font-medium text-gray-800">{m.label}</span>
                <span className="text-xs text-gray-500 ml-2">{m.desc}</span>
              </div>
            </button>
          ))}
        </div>
        {method==='caesar'&&(
          <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Shift</span><span className="font-mono text-blue-600">{shift}</span></div>
            <input type="range" min="1" max="25" value={shift} onChange={e=>setShift(Number(e.target.value))} className="w-full"/></div>
        )}
        {method==='xor'&&(
          <div><label className="block text-xs text-gray-600 mb-1">Key</label>
            <input value={key} onChange={e=>setKey(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-1.5 font-mono text-sm"/></div>
        )}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/></div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Output</label>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
          <textarea readOnly value={output()} rows={4} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/>
        </div>
      </div>
    </ToolLayout>
  )
}