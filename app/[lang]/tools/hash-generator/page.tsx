'use client'
import { useState, useEffect } from 'react'

async function computeHash(text:string,algo:string):Promise<string>{
  const encoder=new TextEncoder()
  const data=encoder.encode(text)
  const hashBuffer=await crypto.subtle.digest(algo,data)
  const hashArray=Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b=>b.toString(16).padStart(2,'0')).join('')
}

const ALGOS=['SHA-1','SHA-256','SHA-384','SHA-512']

export default function HashGeneratorPage() {
  const [input,setInput]=useState('Hello, World!')
  const [hashes,setHashes]=useState<Record<string,string>>({})
  const [copied,setCopied]=useState<string|null>(null)
  const [inputType,setInputType]=useState<'text'|'hex'>('text')

  useEffect(()=>{
    if(!input){setHashes({});return}
    Promise.all(ALGOS.map(async a=>{const h=await computeHash(input,a);return[a,h] as [string,string]})).then(entries=>setHashes(Object.fromEntries(entries)))
  },[input])

  function copy(algo:string){
    navigator.clipboard.writeText(hashes[algo]||'')
    setCopied(algo);setTimeout(()=>setCopied(null),1500)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hash Generator</h1>
        <p className="text-gray-500 mb-8">Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes — computed locally in your browser</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
              placeholder="Enter text to hash..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">{input.length} characters · {new TextEncoder().encode(input).length} bytes</p>
          </div>
        </div>
        {Object.keys(hashes).length>0&&(
          <div className="mt-4 space-y-3">
            {ALGOS.map(algo=>(
              <div key={algo} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{algo}</span>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400">{(hashes[algo]||'').length/2*8} bits</span>
                    <button onClick={()=>copy(algo)} className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded">
                      {copied===algo?'\u2713':'Copy'}
                    </button>
                  </div>
                </div>
                <p className="font-mono text-xs text-gray-600 break-all bg-gray-50 rounded-lg p-2">{hashes[algo]}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3 text-center">\u{1F512} All hashing happens in your browser using the Web Crypto API — no data is sent to any server</p>
      </div>
    </main>
  )
}