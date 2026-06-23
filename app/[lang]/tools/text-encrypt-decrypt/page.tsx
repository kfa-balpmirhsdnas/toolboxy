'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function caesar(text:string,shift:number){return text.replace(/[a-zA-Z]/g,c=>{const base=c<='Z'?65:97;return String.fromCharCode(((c.charCodeAt(0)-base+shift+26)%26)+base)})}
function rot13(text:string){return caesar(text,13)}
function xorCipher(text:string,key:string){if(!key)return text;return text.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^key.charCodeAt(i%key.length))).join('')}
function b64e(s:string){try{return btoa(unescape(encodeURIComponent(s)))}catch{return 'Error'}}
function b64d(s:string){try{return decodeURIComponent(escape(atob(s)))}catch{return 'Error: invalid Base64'}}
const METHODS=['Caesar Cipher','ROT13','XOR Cipher','Base64 Encode','Base64 Decode']
export default function Page(){
  const [input,setInput]=useState('')
  const [method,setMethod]=useState('ROT13')
  const [key,setKey]=useState('13')
  const process=()=>{
    if(method==='Caesar Cipher')return caesar(input,parseInt(key)||13)
    if(method==='ROT13')return rot13(input)
    if(method==='XOR Cipher')return xorCipher(input,key)
    if(method==='Base64 Encode')return b64e(input)
    if(method==='Base64 Decode')return b64d(input)
    return ''
  }
  const output=process()
  const tool=TOOLS.find(t=>t.slug==='text-encrypt-decrypt')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {METHODS.map(m=><button key={m} onClick={()=>setMethod(m)} className={'px-3 py-1.5 rounded-lg text-xs font-medium border '+(method===m?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{m}</button>)}
        </div>
        {(method==='Caesar Cipher'||method==='XOR Cipher')&&(
          <label className="flex items-center gap-2 text-sm text-gray-700">
            {method==='Caesar Cipher'?'Shift':'Key'}
            <input value={key} onChange={e=>setKey(e.target.value)} type={method==='Caesar Cipher'?'number':'text'} min={0} max={25} className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"/></label>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Input</p>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8} placeholder="Enter text..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><p className="text-xs font-semibold text-gray-600 mb-1">Output</p>
            <textarea value={output} readOnly rows={8} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono resize-none"/></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>navigator.clipboard?.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Copy</button>
          <button onClick={()=>setInput(output)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Swap</button>
        </div>
      </div>
    </ToolLayout>
  )
}