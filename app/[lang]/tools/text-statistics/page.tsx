'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('text-statistics')!

function getStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/) : []
  const sentences = text.split(/[.!?]+/).filter(s=>s.trim())
  const paragraphs = text.split(/\n{2,}/).filter(p=>p.trim())
  const chars = Array.from(text).length
  
  // Average word length
  const totalWordLen = words.reduce((s,w)=>s+w.replace(/[^a-zA-Z]/g,'').length,0)
  const avgWordLen = words.length ? (totalWordLen/words.length) : 0
  
  // Sentence stats
  const avgWordsPerSentence = sentences.length ? words.length/sentences.length : 0
  
  // Character frequency
  const freq: Record<string,number> = {}
  for (const c of text.toLowerCase()) {
    if (/[a-z]/.test(c)) freq[c] = (freq[c]||0)+1
  }
  const topChars = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
  
  // Flesch reading ease (approximate)
  const syllables = words.reduce((s,w)=>{
    const v = w.toLowerCase().match(/[aeiouy]+/g)
    return s + (v ? Math.max(1,v.length) : 1)
  },0)
  const flesh = sentences.length && words.length ? 
    206.835 - 1.015*(words.length/sentences.length) - 84.6*(syllables/words.length) : 0
  
  const fleshLabel = flesh >= 90 ? 'Very Easy' : flesh >= 70 ? 'Easy' : flesh >= 60 ? 'Standard' : flesh >= 50 ? 'Fairly Difficult' : flesh >= 30 ? 'Difficult' : 'Very Difficult'
  
  return { chars, words: words.length, sentences: sentences.length, paragraphs: paragraphs.length, avgWordLen, avgWordsPerSentence, topChars, flesh, fleshLabel, readTime: Math.ceil(words.length/200), syllables }
}

export default function TextStatisticsPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const tracked = useRef(false)
  
  function track() {
    if (!tracked.current) { trackToolUsed('text-statistics'); tracked.current = true }
  }
  
  const s = text.trim() ? getStats(text) : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={text} onChange={e=>{setText(e.target.value);track()}} placeholder="Paste text for detailed statistics..." rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {s && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[['Characters',s.chars],['Words',s.words],['Sentences',s.sentences],['Paragraphs',s.paragraphs]].map(([label,val])=>(
                <div key={String(label)} className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-brand-700">{Number(val).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{String(label)}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Avg word length</p>
                <p className="text-lg font-bold text-gray-800">{s.avgWordLen.toFixed(1)} chars</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Words per sentence</p>
                <p className="text-lg font-bold text-gray-800">{s.avgWordsPerSentence.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Reading time</p>
                <p className="text-lg font-bold text-gray-800">~{s.readTime} min</p>
              </div>
            </div>
            {s.words >= 5 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-600 mb-2">Flesch Reading Ease: <span className="text-brand-700">{s.flesh.toFixed(0)} — {s.fleshLabel}</span></p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: Math.max(0,Math.min(100,s.flesh))+'%' }} />
                </div>
              </div>
            )}
            {s.topChars.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-600 mb-3">Most frequent letters</p>
                <div className="flex gap-3">
                  {s.topChars.map(([c,count])=>(
                    <div key={c} className="text-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-brand-100 text-brand-700 font-bold text-lg rounded-xl">{c.toUpperCase()}</div>
                      <p className="text-xs text-gray-500 mt-1">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
