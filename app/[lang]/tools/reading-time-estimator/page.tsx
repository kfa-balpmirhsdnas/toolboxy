'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('reading-time-estimator')!
export default function ReadingTimeEstimatorPage() {
  const [text,setText]=useState('')
  const [wpm,setWpm]=useState(238)
  const WPM_PRESETS=[{label:'Slow',val:150},{label:'Average',val:238},{label:'Fast',val:350},{label:'Speed reader',val:700}]
  const words=text.trim()?text.trim().split(/\s+/).length:0
  const chars=text.length
  const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length
  const paragraphs=text.split(/\n\n+/).filter(p=>p.trim()).length||1
  const mins=words/wpm
  const secs=Math.round(mins*60)
  const fmt=(s:number)=>{
    if(s<60)return s+'s'
    const m=Math.floor(s/60),r=s%60
    return m+'m'+(r>0?' '+r+'s':'')
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Paste your text</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} placeholder="Paste or type your text here..." className="w-full rounded border border-gray-300 px-3 py-2 resize-none"/></div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Reading speed</label>
            <span className="text-sm text-blue-600 font-medium">{wpm} WPM</span>
          </div>
          <div className="flex gap-2 mb-2">
            {WPM_PRESETS.map(p=>(
              <button key={p.val} onClick={()=>setWpm(p.val)}
                className={`flex-1 py-1.5 rounded border text-xs font-medium transition ${wpm===p.val?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{p.label}</button>
            ))}
          </div>
          <input type="range" min="50" max="1000" value={wpm} onChange={e=>setWpm(Number(e.target.value))} className="w-full"/>
        </div>
        {words>0?(
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{fmt(secs)}</p>
              <p className="text-xs text-blue-500 mt-1">Reading time</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-700">{words.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Words</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-700">{chars.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Characters</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-700">{sentences}</p>
              <p className="text-xs text-gray-500 mt-1">Sentences</p>
            </div>
          </div>
        ):(
          <p className="text-center text-gray-400 py-8">Paste some text to estimate reading time</p>
        )}
        {words>0&&<div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <p>At <strong>{wpm} WPM</strong>: <strong>{Math.floor(mins)}</strong> minute{Math.floor(mins)!==1?'s':''} {Math.round((mins%1)*60)} seconds to read this {paragraphs}-paragraph text.</p>
        </div>}
      </div>
    </ToolLayout>
  )
}