'use client'
import { useState } from 'react'

type SortMode = 'az'|'za'|'num-asc'|'num-desc'|'len-asc'|'len-desc'|'random'|'reverse'

export default function ListSorterPage() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<SortMode>('az')
  const [dedup, setDedup] = useState(false)
  const [trimLines, setTrimLines] = useState(true)
  const [copied, setCopied] = useState(false)

  const lines = input.split('\n').map(l=>trimLines?l.trim():l).filter(l=>l!=='')
  let sorted = [...lines]
  if(mode==='az') sorted.sort((a,b)=>a.localeCompare(b))
  else if(mode==='za') sorted.sort((a,b)=>b.localeCompare(a))
  else if(mode==='num-asc') sorted.sort((a,b)=>parseFloat(a)-parseFloat(b))
  else if(mode==='num-desc') sorted.sort((a,b)=>parseFloat(b)-parseFloat(a))
  else if(mode==='len-asc') sorted.sort((a,b)=>a.length-b.length)
  else if(mode==='len-desc') sorted.sort((a,b)=>b.length-a.length)
  else if(mode==='random') sorted.sort(()=>Math.random()-0.5)
  else sorted.reverse()
  if(dedup) sorted=[...new Set(sorted)]
  const output = sorted.join('\n')

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  const MODES:[SortMode,string][]=[['az','A \u2192 Z'],['za','Z \u2192 A'],['num-asc','1 \u2192 9'],['num-desc','9 \u2192 1'],['len-asc','Short first'],['len-desc','Long first'],['random','Random'],['reverse','Reverse']]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List Sorter</h1>
        <p className="text-gray-500 mb-8">Sort, deduplicate and reorder lists in multiple ways</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input List (one item per line)</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8}
              placeholder="banana\napple\ncherry\ndate"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            {MODES.map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)}
                className={'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors '+(mode===m?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={dedup} onChange={e=>setDedup(e.target.checked)} className="rounded" /><span className="text-sm">Remove duplicates</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={trimLines} onChange={e=>setTrimLines(e.target.checked)} className="rounded" /><span className="text-sm">Trim whitespace</span></label>
          </div>
        </div>
        {lines.length>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">{sorted.length} item{sorted.length!==1?'s':''}</span>
              <button onClick={copy} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">{copied?'\u2713 Copied':'Copy'}</button>
            </div>
            <textarea value={output} readOnly rows={Math.min(sorted.length+1,12)} className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm bg-gray-50 resize-none" />
          </div>
        )}
      </div>
    </main>
  )
}