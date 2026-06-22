'use client'
import { useState } from 'react'

const SEPS = [
  {id:'nl',  label:'New Line', fn:()=>'\n'},
  {id:'none',label:'None',     fn:()=>''},
  {id:'sp',  label:'Space',    fn:()=>' '},
  {id:'cm',  label:'Comma',    fn:()=>', '},
  {id:'tb',  label:'Tab',      fn:()=>'\t'},
  {id:'pp',  label:'Pipe',     fn:()=>' | '},
]

export default function TextRepeaterPage() {
  const [text, setText] = useState('')
  const [count, setCount] = useState(5)
  const [sepId, setSepId] = useState('nl')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  function repeat() {
    if (!text || count < 1) return
    const sep = SEPS.find(s=>s.id===sepId)?.fn() ?? '\n'
    setOutput(Array(count).fill(text).join(sep))
  }

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Repeater</h1>
        <p className="text-gray-500 mb-8">Repeat any text multiple times with a custom separator</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text to Repeat</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} placeholder="Enter text here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Count</label>
              <input type="number" min={1} max={1000} value={count} onChange={e=>setCount(Math.max(1,parseInt(e.target.value)||1))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
              <select value={sepId} onChange={e=>setSepId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {SEPS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={repeat} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Repeat Text</button>
        </div>
        {output && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Output ({count} repetitions)</span>
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                {copied ? '\u2713 Copied' : 'Copy'}
              </button>
            </div>
            <textarea value={output} readOnly rows={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50 resize-none" />
          </div>
        )}
      </div>
    </main>
  )
}