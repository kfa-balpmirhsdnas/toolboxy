'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('jwt-encoder')!
function b64url(s:string):string{
  return btoa(unescape(encodeURIComponent(s))).replace(/+/g,'-').replace(///g,'_').replace(/=+$/,'')
}
function b64urlDec(s:string):string{
  const pad=s.replace(/-/g,'+').replace(/_/g,'/')
  const padded=pad.padEnd(pad.length+((4-pad.length%4)%4),'=')
  try{return decodeURIComponent(escape(atob(padded)))}catch{return ''}
}
export default function JwtEncoderPage() {
  const [alg,setAlg]=useState('HS256')
  const [header,setHeader]=useState(JSON.stringify({alg:'HS256',typ:'JWT'},null,2))
  const [payload,setPayload]=useState(JSON.stringify({sub:'1234567890',name:'John Doe',iat:1516239022,exp:1516242622},null,2))
  const [secret,setSecret]=useState('your-256-bit-secret')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [decInput,setDecInput]=useState('')
  const [copied,setCopied]=useState('')
  const ALGS=['HS256','HS384','HS512']
  const encode=():string=>{
    try{
      const h=b64url(JSON.stringify(JSON.parse(header)))
      const p=b64url(JSON.stringify(JSON.parse(payload)))
      const sig=b64url(secret||'unsigned')
      return h+'.'+p+'.'+sig
    }catch{return 'Invalid JSON in header or payload'}
  }
  const decodeJwt=(t:string)=>{
    try{
      const [h,p]=t.split('.')
      return {header:JSON.stringify(JSON.parse(b64urlDec(h)),null,2),payload:JSON.stringify(JSON.parse(b64urlDec(p)),null,2)}
    }catch{return {header:'',payload:''}}
  }
  const token=encode()
  const decoded=decodeJwt(decInput)
  const copy=(v:string,k:string)=>{navigator.clipboard.writeText(v);setCopied(k);setTimeout(()=>setCopied(''),1500)}
  const Parts=({t}:{t:string})=>{
    const [h,p,s]=t.split('.')
    return <p className="font-mono text-xs break-all leading-relaxed">
      <span className="text-red-500">{h}</span><span className="text-gray-400">.</span>
      <span className="text-purple-600">{p}</span><span className="text-gray-400">.</span>
      <span className="text-blue-500">{s}</span>
    </p>
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('encode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='encode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Encode</button>
          <button onClick={()=>setMode('decode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='decode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Decode</button>
        </div>
        {mode==='encode'?(
          <div className="space-y-3">
            <div className="flex gap-2">
              {ALGS.map(a=>(
                <button key={a} onClick={()=>{setAlg(a);try{const h=JSON.parse(header);h.alg=a;setHeader(JSON.stringify(h,null,2))}catch{}}}
                  className={'px-3 py-1.5 rounded border text-xs font-mono font-medium transition '+(alg===a?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{a}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1 text-red-500">Header</label>
                <textarea value={header} onChange={e=>setHeader(e.target.value)} rows={5} className="w-full rounded border border-red-200 px-2 py-1.5 font-mono text-xs resize-none"/></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1 text-purple-600">Payload</label>
                <textarea value={payload} onChange={e=>setPayload(e.target.value)} rows={5} className="w-full rounded border border-purple-200 px-2 py-1.5 font-mono text-xs resize-none"/></div>
            </div>
            <div><label className="block text-xs font-medium text-blue-600 mb-1">Secret (for display only — no real HMAC)</label>
              <input value={secret} onChange={e=>setSecret(e.target.value)} className="w-full rounded border border-blue-200 px-3 py-1.5 font-mono text-sm"/></div>
            <div className="bg-gray-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Generated Token</span>
                <button onClick={()=>copy(token,'token')} className="text-xs text-blue-400">{copied==='token'?'Copied!':'Copy'}</button>
              </div>
              <Parts t={token}/>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Header</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600 inline-block"/>Payload</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>Signature</div>
            </div>
          </div>
        ):(
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Paste JWT token</label>
              <textarea value={decInput} onChange={e=>setDecInput(e.target.value)} rows={3} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none"/></div>
            {decInput&&<div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-red-500 mb-1">Header</label>
                <pre className="bg-gray-50 rounded border border-red-100 p-2 text-xs overflow-auto">{decoded.header}</pre></div>
              <div><label className="block text-xs font-medium text-purple-600 mb-1">Payload</label>
                <pre className="bg-gray-50 rounded border border-purple-100 p-2 text-xs overflow-auto">{decoded.payload}</pre></div>
            </div>}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}