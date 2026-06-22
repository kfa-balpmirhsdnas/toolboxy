'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('word-frequency-counter')!
export default function WordFrequencyCounterPage() {
  const [text,setText]=useState('The quick brown fox jumps over the lazy dog. The dog barked at the fox.')
  const [top,setTop]=useState(20)
  const [stopwords,setStopwords]=useState(true)
  const SW=new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','it','its','this','that','these','those','he','she','they','we','i','you','be','have','has','had','do','does','did','will','would','could','should','may','might','can','not','no','so','if','as','up','out','about','from','into','then','than','when'])
  const analyze=()=>{
    const words=text.toLowerCase().replace(/[^a-z0-9\s'-]/g,' ').split(/\s+/).filter(w=>w.length>1)
    const filtered=stopwords?words.filter(w=>!SW.has(w)):words
    const freq:Record<string,number>={}
    filtered.forEach(w=>{freq[w]=(freq[w]||0)+1})
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,top)
  }
  const results=text.trim()?analyze():[]
  const max=results[0]?.[1]||1
  const totalWords=text.trim().split(/\s+/).filter(w=>w).length
  const uniqueWords=new Set(text.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>1)).size
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Paste text here..."
          className="w-full rounded border border-gray-300 px-3 py-2 resize-none" spellCheck={false}/>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Show top:</span>
            {[10,20,50].map(n=>(
              <button key={n} onClick={()=>setTop(n)} className={`px-2.5 py-1 rounded border text-xs font-medium transition ${top===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{n}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={stopwords} onChange={e=>setStopwords(e.target.checked)} className="rounded"/>
            <span className="text-gray-600">Filter stopwords</span>
          </label>
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Total words: <strong className="text-gray-800">{totalWords.toLocaleString()}</strong></span>
          <span>Unique words: <strong className="text-gray-800">{uniqueWords.toLocaleString()}</strong></span>
        </div>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {results.map(([word,count],i)=>(
            <div key={word} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-5 text-right">{i+1}</span>
              <span className="font-mono text-sm text-gray-700 w-28 truncate">{word}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{width:(count/max*100)+'%'}}/>
              </div>
              <span className="text-sm font-bold text-gray-700 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}