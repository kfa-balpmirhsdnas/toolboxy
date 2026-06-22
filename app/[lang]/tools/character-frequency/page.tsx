'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('character-frequency')!

export default function CharacterFrequencyPage() {
  const [text,setText]=useState('The quick brown fox jumps over the lazy dog')
  const [mode,setMode]=useState<'char'|'word'|'ngram'>('char')
  const [ignoreCase,setIgnoreCase]=useState(true)
  const [ignoreSpaces,setIgnoreSpaces]=useState(false)
  const [ngramSize,setNgramSize]=useState(2)

  const processed=ignoreCase?text.toLowerCase():text

  let freqMap:Map<string,number>=new Map()
  if(mode==='char'){
    const chars=ignoreSpaces?processed.replace(/\s/g,''):processed
    for(const c of chars) freqMap.set(c,(freqMap.get(c)||0)+1)
  }else if(mode==='word'){
    const words=processed.match(/\b[a-zA-Z']+\b/g)||[]
    for(const w of words) freqMap.set(w,(freqMap.get(w)||0)+1)
  }else{
    const src=ignoreSpaces?processed.replace(/\s/g,''):processed
    for(let i=0;i<=src.length-ngramSize;i++){
      const ng=src.slice(i,i+ngramSize)
      freqMap.set(ng,(freqMap.get(ng)||0)+1)
    }
  }

  const sorted=[...freqMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,50)
  const maxCount=sorted[0]?.[1]||1
  const totalChars=text.length
  const uniqueChars=freqMap.size

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Character Frequency</h1>
        <p className="text-gray-500 mb-6">Analyze character, word, or n-gram frequency in any text</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3 mb-4">
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="Enter text to analyze..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1">
              {([['char','Characters'],['word','Words'],['ngram','N-grams']] as const).map(([m,l])=>(
                <button key={m} onClick={()=>setMode(m)} className={'px-3 py-1.5 text-sm rounded-lg font-medium '+(mode===m?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{l}</button>
              ))}
            </div>
            {mode==='ngram'&&<div className="flex items-center gap-1 text-sm"><label>N=</label><input type="number" value={ngramSize} min={2} max={5} onChange={e=>setNgramSize(parseInt(e.target.value)||2)} className="w-12 border border-gray-300 rounded px-2 py-1 text-center" /></div>}
            <label className="flex items-center gap-1 text-sm cursor-pointer"><input type="checkbox" checked={ignoreCase} onChange={e=>setIgnoreCase(e.target.checked)} className="rounded" />Ignore case</label>
            {mode==='char'&&<label className="flex items-center gap-1 text-sm cursor-pointer"><input type="checkbox" checked={ignoreSpaces} onChange={e=>setIgnoreSpaces(e.target.checked)} className="rounded" />Ignore spaces</label>}
          </div>
          <p className="text-xs text-gray-400">{totalChars} characters · {uniqueChars} unique {mode==='char'?'characters':mode==='word'?'words':'n-grams'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Top {Math.min(sorted.length,50)} by frequency</h2>
          <div className="space-y-1.5 max-h-[500px] overflow-auto">
            {sorted.map(([char,count])=>(
              <div key={char} className="flex items-center gap-3">
                <span className="font-mono text-sm text-gray-700 w-16 flex-shrink-0 text-right">{char===''?' ':char==='\n'?'\\n':char==='\t'?'\\t':char}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div style={{width:(count/maxCount*100)+'%'}} className="h-5 bg-brand-400 rounded-full" />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                <span className="text-xs text-gray-400 w-12 text-right">{(count/([...freqMap.values()].reduce((a,b)=>a+b,0))*100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}