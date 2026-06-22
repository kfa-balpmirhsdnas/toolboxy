'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('typing-speed-test')!
const TEXTS=[
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump! The five boxing wizards jump quickly.',
  'Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz.',
  'The job requires extra pluck and zeal from every young wage earner.',
  'A mad boxer shot a quick gloved jab to the jaw of his dizzy opponent.',
]
export default function TypingSpeedTestPage() {
  const [textIdx,setTextIdx]=useState(0)
  const text=TEXTS[textIdx]
  const [typed,setTyped]=useState('')
  const [started,setStarted]=useState(false)
  const [finished,setFinished]=useState(false)
  const [startTime,setStartTime]=useState(0)
  const [elapsed,setElapsed]=useState(0)
  const [errors,setErrors]=useState(0)
  const inputRef=useRef<HTMLInputElement>(null)
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const reset=()=>{
    setTyped('');setStarted(false);setFinished(false);setStartTime(0);setElapsed(0);setErrors(0)
    if(timerRef.current)clearInterval(timerRef.current)
    setTextIdx(i=>(i+1)%TEXTS.length)
    setTimeout(()=>inputRef.current?.focus(),100)
  }
  const handleType=(val:string)=>{
    if(finished)return
    if(!started&&val.length>0){
      setStarted(true);const now=Date.now();setStartTime(now)
      timerRef.current=setInterval(()=>setElapsed(Date.now()-now),100)
    }
    if(val.length>text.length)return
    setTyped(val)
    let err=0
    for(let i=0;i<val.length;i++){if(val[i]!==text[i])err++}
    setErrors(err)
    if(val===text){
      setFinished(true)
      if(timerRef.current)clearInterval(timerRef.current)
    }
  }
  useEffect(()=>()=>{if(timerRef.current)clearInterval(timerRef.current)},[])
  const secs=elapsed/1000
  const words=text.split(' ').length
  const wpm=secs>0?Math.round(words/(secs/60)):0
  const accuracy=typed.length>0?Math.round(((typed.length-errors)/typed.length)*100):100
  const progress=Math.round(typed.length/text.length*100)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        {!finished&&<div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-blue-600">{wpm}</p>
            <p className="text-xs text-gray-500">WPM</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-700">{secs.toFixed(1)}s</p>
            <p className="text-xs text-gray-500">Time</p>
          </div>
        </div>}
        <div className="bg-gray-100 rounded-xl p-4 font-mono text-base leading-relaxed select-none">
          {text.split('').map((ch,i)=>{
            let cls='text-gray-400'
            if(i<typed.length){cls=typed[i]===ch?'text-gray-800':'text-red-500 bg-red-100 rounded'}
            if(i===typed.length)cls='text-gray-800 border-b-2 border-blue-500'
            return <span key={i} className={cls}>{ch}</span>
          })}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{width:progress+'%'}}/>
        </div>
        {!finished?(
          <input ref={inputRef} value={typed} onChange={e=>handleType(e.target.value)}
            placeholder="Click here and start typing..." autoFocus
            className={'w-full rounded border px-3 py-2.5 font-mono text-sm outline-none '+(errors>0?'border-red-300 bg-red-50':'border-gray-300 focus:border-blue-500')}/>
        ):(
          <div className="text-center space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <p className="text-5xl font-bold text-green-700">{wpm} WPM</p>
              <p className="text-gray-600 mt-2">{accuracy}% accuracy in {secs.toFixed(1)} seconds</p>
              {errors>0&&<p className="text-sm text-red-500 mt-1">{errors} error{errors!==1?'s':''}</p>}
            </div>
            <button onClick={reset} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Try Again</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}