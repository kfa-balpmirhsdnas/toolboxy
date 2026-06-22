'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('word-counter')!

export default function WordCounterPage() {
  const [text, setText] = useState('')

  const chars       = text.length
  const charsNoSpace= text.replace(/\s/g,'').length
  const words       = text.trim()===''?0:text.trim().split(/\s+/).length
  const sentences   = text.trim()===''?0:(text.match(/[.!?]+/g)||[]).length||1
  const paragraphs  = text.trim()===''?0:text.split(/\n\s*\n/).filter(p=>p.trim()!=='').length||1
  const lines       = text===''?0:text.split('\n').length
  const avgWordLen  = words>0?((text.trim().split(/\s+/).reduce((s,w)=>s+w.replace(/[^a-zA-Z]/g,'').length,0))/words).toFixed(1):'0'
  const readTimeSec = Math.ceil(words/200*60)
  const readMin     = Math.floor(readTimeSec/60)
  const readSec     = readTimeSec%60

  // top words
  const freq:Record<string,number>={}
  if(text.trim()) text.toLowerCase().match(/\b[a-z]{3,}\b/g)?.forEach(w=>{freq[w]=(freq[w]||0)+1})
  const topWords=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10)

  const stats=[
    {label:'Characters',val:chars.toLocaleString()},
    {label:'No Spaces',val:charsNoSpace.toLocaleString()},
    {label:'Words',val:words.toLocaleString()},
    {label:'Sentences',val:sentences.toLocaleString()},
    {label:'Paragraphs',val:paragraphs.toLocaleString()},
    {label:'Lines',val:lines.toLocaleString()},
    {label:'Avg Word Len',val:avgWordLen},
    {label:'Read Time',val:readMin>0?readMin+'m '+readSec+'s':readSec+'s'},
  ]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Word Counter</h1>
        <p className="text-gray-500 mb-8">Count words, characters, sentences, and get detailed text statistics instantly</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={10}
            placeholder="Type or paste your text here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({label,val})=>(
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className="text-2xl font-bold text-brand-600">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        {topWords.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Top Words (3+ letters)</h2>
            <div className="flex flex-wrap gap-2">
              {topWords.map(([w,c])=>(
                <div key={w} className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-brand-700">{w}</span>
                  <span className="text-xs bg-brand-200 text-brand-800 rounded-full px-1.5">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}