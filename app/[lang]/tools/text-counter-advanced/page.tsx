'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('text-counter-advanced')!

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g,'')
  if (!word) return 0
  const matches = word.match(/[aeiouy]+/g)
  let count = matches ? matches.length : 0
  if (word.endsWith('e') && count > 1) count--
  return Math.max(1, count)
}

function getStats(text: string) {
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g,'').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s=>s.trim()).length : 0
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter(p=>p.trim()).length : 0
  const lines = text.split('\n').length
  const unique = text.trim() ? new Set(text.toLowerCase().trim().split(/\s+/)).size : 0
  const avgWordLen = words ? Math.round(charsNoSpace/words*10)/10 : 0
  const avgSentLen = sentences && words ? Math.round(words/sentences*10)/10 : 0
  const syllables = text.trim().split(/\s+/).reduce((a,w)=>a+countSyllables(w),0)
  const readTime = Math.ceil(words/200) // 200 wpm
  const speakTime = Math.ceil(words/130) // 130 wpm

  // Top word frequency
  const freq: Record<string,number> = {}
  if (text.trim()) {
    text.toLowerCase().match(/\b[a-z]{3,}\b/g)?.forEach(w=>{ freq[w]=(freq[w]||0)+1 })
  }
  const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10)

  return { chars, charsNoSpace, words, sentences, paragraphs, lines, unique, avgWordLen, avgSentLen, syllables, readTime, speakTime, topWords }
}

export default function TextCounterAdvancedPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const tracked = useRef(false)
  function track() { if (!tracked.current) { trackToolUsed('text-counter-advanced'); tracked.current = true } }

  const s = getStats(text)

  const STATS = [
    { label:'Characters',         value:s.chars },
    { label:'Chars (no space)',   value:s.charsNoSpace },
    { label:'Words',              value:s.words },
    { label:'Unique words',       value:s.unique },
    { label:'Sentences',          value:s.sentences },
    { label:'Paragraphs',         value:s.paragraphs },
    { label:'Lines',              value:s.lines },
    { label:'Syllables',          value:s.syllables },
    { label:'Avg word length',    value:s.avgWordLen+' chars' },
    { label:'Avg sentence length',value:s.avgSentLen+' words' },
    { label:'Read time',          value:s.readTime+' min' },
    { label:'Speak time',         value:s.speakTime+' min' },
  ]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={text} onChange={e=>{setText(e.target.value);track()}} rows={6}
          placeholder="Paste or type your text here..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STATS.map(st=>(
            <div key={st.label} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-500">{st.label}</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{st.value}</p>
            </div>
          ))}
        </div>
        {s.topWords.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Top Words</p>
            <div className="flex flex-wrap gap-2">
              {s.topWords.map(([word,count])=>(
                <span key={word} className="px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-lg text-xs">
                  {word} <span className="font-bold">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
