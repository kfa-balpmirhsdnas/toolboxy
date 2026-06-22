'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('word-frequency-counter')!
const STOP_WORDS=new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','this','that','these','those','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their','what','which','who','when','where','why','how','not','no','nor','so','yet','both','either','neither'])
export default function WordFrequencyCounterPage() {
  const [text,setText]=useState('The quick brown fox jumps over the lazy dog. The dog barked at the fox, but the fox was quick to escape. Quick thinking saved the fox from the barking dog.')
  const [excludeStop,setExcludeStop]=useState(false)
  const [minLen,setMinLen]=useState(1)
  const [topN,setTopN]=useState(20)
  const result=useMemo(()=>{
    const words=text.toLowerCase().replace(/[^a-z0-9s'-]/g,' ').split(/s+/).filter(w=>w.length>=minLen&&(!excludeStop||!STOP_WORDS.has(w)))
    const freq:Record<string,number>={}
    for(const w of words)if(w)freq[w]=(freq[w]||0)+1
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,topN)
  },[text,excludeStop,minLen,topN])
  const maxFreq=result[0]?.[1]||1
  const totalWords=text.split(/s+/).filter(Boolean).length
  const uniqueWords=new Set(text.toLowerCase().replace(/[^a-z0-9s]/g,' ').split(/s+/).filter(Boolean)).size
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={5}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
          placeholder="Paste your text here..."/>
        <div className="flex flex-wrap gap-3 text-sm items-center">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={excludeStop} onChange={e=>setExcludeStop(e.target.checked)} className="rounded"/>
            <span className="text-gray-600">Exclude stop words</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">Min length:</span>
            <select value={minLen} onChange={e=>setMinLen(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-sm">
              {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">Top:</span>
            <select value={topN} onChange={e=>setTopN(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-sm">
              {[10,20,30,50].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Total words',totalWords],['Unique words',uniqueWords],['Top words shown',result.length]].map(([l,v])=>(
            <div key={l} className="bg-blue-50 rounded-xl py-3">
              <p className="text-xl font-bold text-blue-700">{v}</p>
              <p className="text-xs text-blue-500">{l}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {result.map(([w,n],i)=>(
            <div key={w} className="flex items-center gap-2">
              <span className="w-5 text-xs text-gray-400 text-right">{i+1}</span>
              <span className="w-28 font-mono text-sm font-medium text-gray-800 truncate">{w}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-blue-500 rounded-full transition-all" style={{width:(n/maxFreq*100)+'%'}}/>
              </div>
              <span className="w-8 text-right text-sm font-bold text-gray-700">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}