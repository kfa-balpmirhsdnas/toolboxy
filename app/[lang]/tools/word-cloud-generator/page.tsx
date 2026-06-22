'use client'
import { useState, useEffect, useRef } from 'react'

function getWordFreq(text: string): Array<{word:string,count:number}> {
  const words = text.toLowerCase().match(/[a-zA-Z'\u00C0-\u024F]+/g) || []
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','it','this','that','be','as','i','you','he','she','we','they','have','has','had','do','did','will','would','could','should','may','can','not','from','by','about','into','than','so','if','my','your','our','their','its','am','been','being','up','out','what','which','who','whom','when','where','how','all','also','just','no','more','one','only','other','such'])
  const freq: Record<string,number> = {}
  words.forEach(w => { if(w.length > 2 && !stopWords.has(w)) freq[w] = (freq[w]||0)+1 })
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,60).map(([word,count])=>({word,count}))
}

const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4','#6366f1','#84cc16','#f97316']
const SAMPLE = `The quick brown fox jumps over the lazy dog. 
Technology innovation drives economic growth and social change. 
Machine learning artificial intelligence data science automation future.
Creative design beautiful interface user experience product development.
Music art culture literature philosophy science history human knowledge.`

export default function WordCloudGenerator() {
  const [text,setText]=useState(SAMPLE)
  const [maxWords,setMaxWords]=useState(40)
  const words=getWordFreq(text).slice(0,maxWords)
  const maxCount=words[0]?.count||1

  const getFontSize=(count:number)=>Math.round(14+((count/maxCount)**0.6)*52)
  const getColor=(i:number)=>COLORS[i%COLORS.length]

  const [copied,setCopied]=useState(false)
  const copy=async()=>{await navigator.clipboard.writeText(words.map(w=>w.word).join(', '));setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Word Cloud Generator</h1>
        <p className="text-gray-500 mb-8">Visualize the most frequent words in your text as a word cloud. Stop words are automatically filtered.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">Input Text</span>
              <button onClick={()=>setText('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
            <textarea value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-5 text-sm resize-none focus:outline-none rounded-b-2xl" rows={12} placeholder="Paste your text here..."/>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Max words: <span className="text-blue-600">{maxWords}</span></label>
              <input type="range" min="10" max="60" value={maxWords} onChange={e=>setMaxWords(Number(e.target.value))} className="w-full accent-blue-600"/>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 text-center text-sm text-gray-500">
              {words.length} unique words found
            </div>
          </div>
        </div>
        {words.length>0&&(
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-700">Word Cloud</h3>
              <button onClick={copy} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium">{copied?'✓ Copied!':'Copy words'}</button>
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-center min-h-48 leading-loose">
              {words.map((w,i)=>(
                <span key={w.word} title={`"${w.word}": ${w.count} occurrence${w.count>1?'s':''}`}
                  style={{fontSize:getFontSize(w.count)+'px',color:getColor(i),fontWeight:w.count>maxCount*0.5?700:400,opacity:0.85+0.15*(w.count/maxCount)}}
                  className="hover:opacity-100 cursor-default transition-opacity select-none">
                  {w.word}
                </span>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">Top 10 words:</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {words.slice(0,10).map((w,i)=>(
                  <div key={w.word} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-xs font-bold text-gray-400 w-4">{i+1}</span>
                    <span className="font-medium text-gray-800 text-sm truncate">{w.word}</span>
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{w.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}