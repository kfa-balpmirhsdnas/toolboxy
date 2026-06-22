'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-encrypt-decrypt')!
function rot13(t:string){return t.replace(/[A-Za-z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b)})}
function caesar(t:string,sh:number,dec:boolean){const s=dec?(26-sh%26)%26:sh%26;return t.replace(/[A-Za-z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(((c.charCodeAt(0)-b+s)%26)+b)})}
function atbash(t:string){return t.replace(/[A-Za-z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(b+25-(c.charCodeAt(0)-b))})}
function vigenere(t:string,key:string,dec:boolean){const k=key.toUpperCase().replace(/[^A-Z]/g,'');if(!k)return t;let ki=0;return t.replace(/[A-Za-z]/g,c=>{const b=c<='Z'?65:97;const sh=k.charCodeAt(ki++%k.length)-65;const s=dec?(26-sh)%26:sh;return String.fromCharCode(((c.charCodeAt(0)-b+s)%26)+b)})}
function b64e(t:string){try{return btoa(unescape(encodeURIComponent(t)))}catch{return 'Error'}}
function b64d(t:string){try{return decodeURIComponent(escape(atob(t.trim())))}catch{return 'Invalid Base64'}}
type M='rot13'|'caesar'|'atbash'|'base64'|'vigenere'
export default function TextEncryptDecryptPage() {
  const [input,setInput]=useState('')
  const [output,setOutput]=useState('')
  const [method,setMethod]=useState<M>('rot13')
  const [shift,setShift]=useState(3)
  const [vKey,setVKey]=useState('KEY')
  const [copied,setCopied]=useState(false)
  const run=(dec:boolean)=>{
    let r=''
    if(method==='rot13')r=rot13(input)
    else if(method==='caesar')r=caesar(input,shift,dec)
    else if(method==='atbash')r=atbash(input)
    else if(method==='base64')r=dec?b64d(input):b64e(input)
    else r=vigenere(input,vKey,dec)
    setOutput(r)
  }
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const MS:[M,string][]=[['rot13','ROT13'],['caesar','Caesar'],['atbash','Atbash'],['base64','Base64'],['vigenere','Vigenere']]
  const symmetric=method==='rot13'||method==='atbash'
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {MS.map(([id,label])=>(
            <button key={id} onClick={()=>setMethod(id)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${method===id?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>
        {method==='caesar'&&(
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Shift:</label>
            <input type="number" value={shift} onChange={e=>setShift(parseInt(e.target.value)||1)} min="1" max="25" className="w-20 rounded border border-gray-300 px-2 py-1.5"/>
          </div>
        )}
        {method==='vigenere'&&(
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Keyword:</label>
            <input value={vKey} onChange={e=>setVKey(e.target.value)} placeholder="e.g. SECRET" className="flex-1 rounded border border-gray-300 px-3 py-1.5"/>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
            placeholder="Enter text..." className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none"/>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>run(false)} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">
            {method==='base64'?'Encode':symmetric?'Convert':'Encrypt'}
          </button>
          {!symmetric&&<button onClick={()=>run(true)} className="flex-1 bg-gray-600 text-white rounded-lg py-2.5 font-semibold hover:bg-gray-700">
            {method==='base64'?'Decode':'Decrypt'}
          </button>}
        </div>
        {output&&(
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Output</label>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={5} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}