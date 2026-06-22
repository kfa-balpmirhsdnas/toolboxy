'use client'
import { useState } from 'react'

const ALGOS = ['SHA-1','SHA-256','SHA-384','SHA-512'] as const
type Algo = typeof ALGOS[number]

async function hashText(text:string, algo:Algo): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('')
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  async function generate() {
    if (!input) return
    setLoading(true)
    const results: Record<string,string> = {}
    for (const algo of ALGOS) {
      results[algo] = await hashText(input, algo)
    }
    setHashes(results)
    setLoading(false)
  }

  function copy(algo:string, val:string) {
    navigator.clipboard.writeText(val)
    setCopied(algo)
    setTimeout(()=>setCopied(''),2000)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hash Generator</h1>
        <p className="text-gray-500 mb-8">Generate SHA-1, SHA-256, SHA-384 and SHA-512 cryptographic hashes from text</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4}
              placeholder="Enter text to hash..."
              onKeyDown={e=>{ if(e.key==='Enter'&&e.ctrlKey) generate() }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <button onClick={generate} disabled={loading||!input}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {loading ? 'Generating...' : 'Generate Hashes'}
          </button>
        </div>
        {Object.keys(hashes).length>0&&(
          <div className="mt-6 space-y-3">
            {ALGOS.map(algo=>(
              <div key={algo} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 text-sm">{algo}</span>
                  <button onClick={()=>copy(algo,hashes[algo])}
                    className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    {copied===algo?'\u2713 Copied':'Copy'}
                  </button>
                </div>
                <p className="font-mono text-xs text-gray-600 break-all">{hashes[algo]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}