'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('sha-hash-generator')!
async function sha(alg:string,msg:string):Promise<string>{
  const data=new TextEncoder().encode(msg)
  const hash=await crypto.subtle.digest(alg,data)
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
}
export default function ShaHashGeneratorPage() {
  const [input,setInput]=useState('Hello, World!')
  const [hashes,setHashes]=useState<Record<string,string>>({})
  const [copied,setCopied]=useState('')
  const [loading,setLoading]=useState(false)
  const generate=async()=>{
    if(!input)return
    setLoading(true)
    const [h1,h256,h384,h512]=await Promise.all([sha('SHA-1',input),sha('SHA-256',input),sha('SHA-384',input),sha('SHA-512',input)])
    setHashes({'SHA-1':h1,'SHA-256':h256,'SHA-384':h384,'SHA-512':h512})
    setLoading(false)
  }
  const copy=(alg:string,val:string)=>{navigator.clipboard.writeText(val);setCopied(alg);setTimeout(()=>setCopied(''),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Input text</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 resize-none font-mono text-sm" spellCheck={false}/></div>
        <button onClick={generate} disabled={!input||loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading?'Generating...':'Generate Hashes'}
        </button>
        {Object.keys(hashes).length>0&&(
          <div className="space-y-3">
            {Object.entries(hashes).map(([alg,hash])=>(
              <div key={alg} className="rounded-xl border border-gray-200 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">{alg}</span>
                  <button onClick={()=>copy(alg,hash)} className="text-xs text-blue-600 hover:underline">{copied===alg?'Copied!':'Copy'}</button>
                </div>
                <p className="font-mono text-xs text-gray-600 break-all bg-gray-50 rounded p-2">{hash}</p>
                <p className="text-xs text-gray-400 mt-1">{hash.length} hex chars ({hash.length*4} bits)</p>
              </div>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-400 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Uses Web Crypto API — computations happen entirely in your browser, nothing is sent to a server.
        </div>
      </div>
    </ToolLayout>
  )
}