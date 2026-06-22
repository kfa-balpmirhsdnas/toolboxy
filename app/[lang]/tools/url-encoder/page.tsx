'use client'
import { useState } from 'react'

export default function UrlEncoderPage() {
  const [input,setInput]=useState('Hello World! This is a test: https://example.com/path?q=hello&lang=en')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [component,setComponent]=useState(false)
  const [copied,setCopied]=useState(false)

  let output='',error=''
  try{
    if(mode==='encode'){
      output=component?encodeURIComponent(input):encodeURI(input)
    }else{
      output=component?decodeURIComponent(input):decodeURI(input)
    }
  }catch(e){error=String(e)}

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  function swap(){setInput(output);setMode(m=>m==='encode'?'decode':'encode')}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">URL Encoder / Decoder</h1>
        <p className="text-gray-500 mb-8">Encode or decode URL strings and components</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={()=>setMode('encode')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='encode'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>Encode</button>
            <button onClick={()=>setMode('decode')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='decode'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>Decode</button>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={component} onChange={e=>setComponent(e.target.checked)} className="rounded" />
            <span className="text-gray-700">Component mode (encodeURIComponent — encodes / ? # & = too)</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          {error?(
            <p className="text-red-500 text-sm">{error}</p>
          ):(
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Output</label>
                <div className="flex gap-2">
                  <button onClick={swap} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">\u21C5 Swap</button>
                  <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-700 break-all min-h-[80px]">{output}</div>
            </div>
          )}
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Common Encodings</h2>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            {[['Space','%20'],['&','%26'],['=','%3D'],['+','%2B'],['#','%23'],['/','%2F'],['?','%3F'],['@','%40'],['!','%21']].map(([c,e])=>(
              <div key={c} className="bg-gray-50 rounded-lg p-2 flex justify-between">
                <span className="text-gray-500">{c}</span>
                <span className="text-brand-600">{e}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}