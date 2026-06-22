'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('reading-level-analyzer')!

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g,'')
  if (!word) return 0
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const m = word.match(/[aeiouy]{1,2}/g)
  return m ? m.length : 1
}

function gradeLabel(score: number) {
  if (score >= 90) return { grade: 'Grade 5', level: 'Very Easy', color: 'text-green-600' }
  if (score >= 80) return { grade: 'Grade 6', level: 'Easy', color: 'text-green-500' }
  if (score >= 70) return { grade: 'Grade 7', level: 'Fairly Easy', color: 'text-lime-600' }
  if (score >= 60) return { grade: 'Grades 8–9', level: 'Standard', color: 'text-yellow-600' }
  if (score >= 50) return { grade: 'Grades 10–12', level: 'Fairly Difficult', color: 'text-orange-500' }
  if (score >= 30) return { grade: 'College', level: 'Difficult', color: 'text-red-500' }
  return { grade: 'College Graduate', level: 'Very Difficult', color: 'text-red-700' }
}

function analyze(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s=>s.trim().length>0)
  const words = text.match(/\b[a-zA-Z]+\b/g) || []
  const wordCount = words.length
  const sentCount = Math.max(sentences.length, 1)
  const syllTotal = words.reduce((s,w)=>s+countSyllables(w),0)
  if (wordCount < 10) return null
  const asl = wordCount / sentCount  // avg sentence length
  const asw = syllTotal / wordCount  // avg syllables per word
  const fre = 206.835 - 1.015*asl - 84.6*asw
  const fkgl = 0.39*asl + 11.8*asw - 15.59  // Flesch-Kincaid Grade Level
  return { fre: Math.max(0,Math.min(100,fre)), fkgl: Math.max(0,fkgl), wordCount, sentCount, syllTotal, asl, asw }
}

const SAMPLE = `The cat sat on the mat. It was a warm sunny day. Birds sang in the trees nearby. Children played in the yard below. The breeze was gentle and cool. Everyone felt happy and peaceful. Time moved slowly on days like this. Nothing complicated happened at all. Life was simple and good. The world felt perfectly in order.`

export default function ReadingLevelAnalyzerPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState(SAMPLE)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('reading-level-analyzer'); tracked.current = true } }

  const stats = analyze(text)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={text} onChange={e=>{setText(e.target.value);track()}} rows={7} placeholder="Paste your text here (min 10 words)..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {stats ? (() => {
          const { grade, level, color } = gradeLabel(stats.fre)
          return (
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                <div className={'text-4xl font-bold ' + color}>{Math.round(stats.fre)}</div>
                <div className="text-xs text-gray-500 mt-0.5">Flesch Reading Ease</div>
                <div className={'text-sm font-semibold mt-1 ' + color}>{level} — {grade}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label:'Words', val: stats.wordCount.toLocaleString() },
                  { label:'Sentences', val: stats.sentCount.toLocaleString() },
                  { label:'Syllables', val: stats.syllTotal.toLocaleString() },
                  { label:'Avg sentence length', val: stats.asl.toFixed(1)+' words' },
                  { label:'Avg syllables/word', val: stats.asw.toFixed(2) },
                  { label:'FK Grade Level', val: stats.fkgl.toFixed(1) },
                ].map(item=>(
                  <div key={item.label} className="p-3 bg-white border border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-base font-semibold text-gray-800 mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })() : (
          <p className="text-sm text-gray-400 text-center">Enter at least 10 words to see results.</p>
        )}
      </div>
    </ToolLayout>
  )
}
