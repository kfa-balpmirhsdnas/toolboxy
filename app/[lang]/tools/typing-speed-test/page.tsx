'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('typing-speed-test')!

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "Technology is best when it brings people together. The advance of technology is based on making it fit in so that you don't really notice it.",
  "In the beginning God created the heaven and the earth. And the earth was without form and void and darkness was upon the face of the deep.",
  "All happy families are alike, each unhappy family is unhappy in its own way. It was the best of times, it was the worst of times.",
]

export default function TypingSpeedTestPage({ params }: { params: { lang: string } }) {
  const [textIdx, setTextIdx] = useState(0)
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const tracked = useRef(false)

  const text = TEXTS[textIdx]

  useEffect(() => {
    let id: ReturnType<typeof setInterval>
    if (started && !finished) {
      id = setInterval(()=>setElapsed(Date.now()-startTime),200)
    }
    return ()=>clearInterval(id)
  },[started,finished,startTime])

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    if (!started && val.length>0) {
      setStarted(true); setStartTime(Date.now())
      if (!tracked.current) { trackToolUsed('typing-speed-test'); tracked.current = true }
    }
    setInput(val)
    const mins = (Date.now()-startTime)/60000||0.001
    const words = val.trim().split(/\s+/).filter(Boolean).length
    setWpm(Math.round(words/mins))
    let correct=0; for(let i=0;i<val.length;i++) if(val[i]===text[i]) correct++
    setAccuracy(val.length?Math.round(correct/val.length*100):100)
    if (val===text) { setFinished(true); setElapsed(Date.now()-startTime) }
  }

  function restart(idx=textIdx) {
    setTextIdx(idx); setInput(''); setStarted(false); setFinished(false)
    setElapsed(0); setWpm(0); setAccuracy(100)
    setTimeout(()=>inputRef.current?.focus(),50)
  }

  const chars = text.split('').map((c,i)=>{
    let cls = 'text-gray-300'
    if (i<input.length) cls = input[i]===c?'text-gray-700':'text-red-500 underline'
    if (i===input.length) cls = 'text-gray-700 border-b-2 border-brand-500 animate-pulse'
    return <span key={i} className={cls}>{c}</span>
  })

  const elapsedSec = Math.floor(elapsed/1000)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!finished ? (
          <>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">Text:</span>
              {TEXTS.map((_,i)=>(
                <button key={i} onClick={()=>restart(i)}
                  className={'w-6 h-6 rounded-full text-xs transition-colors ' + (textIdx===i?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>
                  {i+1}
                </button>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm leading-relaxed">{chars}</div>
            <textarea ref={inputRef} value={input} onChange={handleInput} rows={3}
              placeholder="Click here and start typing..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
            <div className="flex gap-4 text-center">
              <div className="flex-1 p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">WPM</p><p className="text-xl font-bold">{started?wpm:'-'}</p></div>
              <div className="flex-1 p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Accuracy</p><p className="text-xl font-bold">{started?accuracy+'%':'-'}</p></div>
              <div className="flex-1 p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Time</p><p className="text-xl font-bold">{started?elapsedSec+'s':'-'}</p></div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-8">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-800">Test Complete!</h3>
            <div className="flex justify-center gap-6">
              <div><p className="text-3xl font-bold text-brand-600">{wpm}</p><p className="text-xs text-gray-500">WPM</p></div>
              <div><p className="text-3xl font-bold text-green-600">{accuracy}%</p><p className="text-xs text-gray-500">Accuracy</p></div>
              <div><p className="text-3xl font-bold text-gray-700">{elapsedSec}s</p><p className="text-xs text-gray-500">Time</p></div>
            </div>
            <button onClick={()=>restart()} className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
              Try Again
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
