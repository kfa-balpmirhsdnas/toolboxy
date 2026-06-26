'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('typing-speed-test')!
const TEXTS=[
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
  'To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.',
  'All that glitters is not gold. Often have you heard that told. Many a man his life hath sold but my outside to behold.',
  'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.',
  'The only way to do great work is to love what you do. If you have not found it yet keep looking and do not settle.',
]
export default function TypingSpeedTestPage() {
  const tr = useTranslations('toolui')
  const [text,setText]=useState(TEXTS[0])
  const [typed,setTyped]=useState('')
  const [started,setStarted]=useState(false)
  const [finished,setFinished]=useState(false)
  const [elapsed,setElapsed]=useState(0)
  const [startTime,setStartTime]=useState(0)
  const intRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const inputRef=useRef<HTMLTextAreaElement>(null)
  const restart=(idx?:number)=>{
    setTyped('');setStarted(false);setFinished(false);setElapsed(0)
    setText(TEXTS[idx??Math.floor(Math.random()*TEXTS.length)])
    if(intRef.current)clearInterval(intRef.current)
    setTimeout(()=>inputRef.current?.focus(),50)
  }
  const onChange=(v:string)=>{
    if(finished)return
    if(!started&&v.length>0){setStarted(true);const t=Date.now();setStartTime(t);intRef.current=setInterval(()=>setElapsed(Date.now()-t),200)}
    setTyped(v)
    if(v===text){setFinished(true);if(intRef.current)clearInterval(intRef.current);setElapsed(Date.now()-startTime)}
  }
  useEffect(()=>()=>{if(intRef.current)clearInterval(intRef.current)},[])
  const words=text.split(' ').length
  const wpm=elapsed>0?Math.round((words/(elapsed/60000))):0
  const chars=text.length
  const correctChars=typed.split('').filter((c,i)=>c===text[i]).length
  const accuracy=typed.length>0?Math.round(correctChars/typed.length*100):100
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="bg-gray-50 rounded-2xl p-5 font-mono text-lg leading-relaxed select-none">
          {text.split('').map((c,i)=>{
            const t=typed[i]
            let cls='text-gray-300'
            if(i<typed.length)cls=t===c?'text-green-600':'text-red-500 bg-red-100 rounded'
            else if(i===typed.length)cls='text-gray-800 underline decoration-blue-500'
            return <span key={i} className={cls}>{c}</span>
          })}
        </div>
        <textarea ref={inputRef} value={typed} onChange={e=>onChange(e.target.value)}
          disabled={finished} rows={3}
          className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400 disabled:opacity-50"
          placeholder={started?'':tr('tst_ph')}/>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[['WPM',started||finished?wpm:'—'],['tst_accuracy',accuracy+'%'],['tst_time',(elapsed/1000).toFixed(1)+'s'],['lip_words',words]].map(([l,v])=>(
            <div key={l} className={'rounded-xl py-3 '+(finished?'bg-green-50':'bg-gray-50')}>
              <p className={'text-xl font-bold '+(finished?'text-green-700':'text-gray-800')}>{v}</p>
              <p className="text-xs text-gray-500">{l==='WPM'?'WPM':tr(l as string)}</p>
            </div>
          ))}
        </div>
        {finished&&<div className="text-center bg-green-50 rounded-2xl py-4 border-2 border-green-300">
          <p className="text-2xl font-bold text-green-700">{tr('tst_complete')}</p>
          <p className="text-sm text-green-600 mt-1">{tr('tst_result',{wpm,acc:accuracy})}</p>
        </div>}
        <div className="flex gap-2 flex-wrap justify-center">
          <button onClick={()=>restart()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{tr('tst_newtext')}</button>
          {TEXTS.map((_,i)=><button key={i} onClick={()=>restart(i)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">{tr('tst_text',{n:i+1})}</button>)}
        </div>
      </div>
    </ToolLayout>
  )
}