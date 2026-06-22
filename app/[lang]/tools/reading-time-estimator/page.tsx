'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('reading-time-estimator')!
const WPM_PRESETS={Slow:150,Average:238,Fast:350,Speed:500}
const SAMPLE=`The art of reading is one of the most valuable skills a person can develop. In our information-rich world, the ability to quickly digest and comprehend written material gives us a significant advantage in both our professional and personal lives.

Studies show that the average adult reads at approximately 238 words per minute when reading non-fiction material. However, reading speed varies considerably based on the complexity of the text, the reader's familiarity with the subject matter, and individual cognitive abilities.

If you want to read faster, practice is essential. Techniques such as chunking — reading groups of words rather than individual words — and reducing subvocalization can dramatically increase your reading speed without sacrificing comprehension.

Regular readers tend to build a larger vocabulary over time, which in turn makes them faster readers. The more words you recognize instantly, the less mental effort each sentence requires.`
export default function ReadingTimeEstimatorPage() {
  const [text,setText]=useState(SAMPLE)
  const [wpm,setWpm]=useState(238)
  const [preset,setPreset]=useState('Average')
  const stats=useMemo(()=>{
    const words=text.trim().split(/s+/).filter(Boolean)
    const chars=text.replace(/s/g,'').length
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0).length
    const paragraphs=text.split(/

+/).filter(Boolean).length
    const readSec=Math.ceil((words.length/wpm)*60)
    const readMin=Math.floor(readSec/60)
    const readSecRem=readSec%60
    return{words:words.length,chars,sentences,paragraphs,readMin,readSecRem,readSec}
  },[text,wpm])
  const setPresetWpm=(name:string,w:number)=>{setPreset(name);setWpm(w)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={8}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
          placeholder="Paste your text here..."/>
        <div className="flex flex-wrap gap-1.5 items-center">
          {Object.entries(WPM_PRESETS).map(([n,w])=>(
            <button key={n} onClick={()=>setPresetWpm(n,w)}
              className={'px-3 py-1.5 rounded-full text-xs font-medium transition border '+(preset===n?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50 text-gray-600')}>
              {n} ({w} WPM)
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-gray-500">Custom WPM:</span>
            <input type="number" value={wpm} onChange={e=>{setWpm(Number(e.target.value));setPreset('')}} min="50" max="1500"
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-center"/>
          </div>
        </div>
        <div className="text-center bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
          <p className="text-xs opacity-80 mb-1">Estimated reading time</p>
          <p className="text-4xl font-bold font-mono">{stats.readMin > 0 ? stats.readMin+'m ' : ''}{stats.readSecRem > 0 ? stats.readSecRem+'s' : stats.readMin===0?'< 1s':''}</p>
          <p className="text-sm opacity-80 mt-1">at {wpm} words per minute</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[['Words',stats.words.toLocaleString()],['Characters',stats.chars.toLocaleString()],['Sentences',stats.sentences],['Paragraphs',stats.paragraphs]].map(([l,v])=>(
            <div key={l} className="text-center bg-gray-50 rounded-xl py-3">
              <p className="text-xl font-bold text-gray-800">{v}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}