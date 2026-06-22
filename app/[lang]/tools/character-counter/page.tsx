'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('character-counter')!
export default function CharacterCounterPage() {
  const [text,setText]=useState('The quick brown fox jumps over the lazy dog.')
  const chars=text.length
  const charsNoSpaces=text.replace(/s/g,'').length
  const words=text.trim()?text.trim().split(/s+/).length:0
  const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length
  const paragraphs=text.split(/

+/).filter(p=>p.trim()).length||1
  const lines=text.split('
').length
  const letters=text.replace(/[^a-zA-Z]/g,'').length
  const digits=text.replace(/[^0-9]/g,'').length
  const spaces=text.replace(/[^ ]/g,'').length
  const unique=new Set(text.toLowerCase().replace(/s/g,'')).size
  const avgWordLen=words>0?parseFloat((charsNoSpaces/words).toFixed(1)):0
  const avgSentLen=sentences>0?parseFloat((words/sentences).toFixed(1)):0
  const STATS=[
    {label:'Characters',val:chars,color:'text-blue-700',bg:'bg-blue-50'},
    {label:'No spaces',val:charsNoSpaces,color:'text-blue-600',bg:'bg-blue-50'},
    {label:'Words',val:words,color:'text-green-700',bg:'bg-green-50'},
    {label:'Sentences',val:sentences,color:'text-purple-700',bg:'bg-purple-50'},
    {label:'Paragraphs',val:paragraphs,color:'text-orange-700',bg:'bg-orange-50'},
    {label:'Lines',val:lines,color:'text-gray-700',bg:'bg-gray-50'},
    {label:'Letters',val:letters,color:'text-indigo-700',bg:'bg-indigo-50'},
    {label:'Digits',val:digits,color:'text-red-700',bg:'bg-red-50'},
    {label:'Spaces',val:spaces,color:'text-gray-600',bg:'bg-gray-50'},
    {label:'Unique chars',val:unique,color:'text-teal-700',bg:'bg-teal-50'},
    {label:'Avg word len',val:avgWordLen,color:'text-cyan-700',bg:'bg-cyan-50'},
    {label:'Avg sentence',val:avgSentLen+' words',color:'text-pink-700',bg:'bg-pink-50'},
  ]
  const [limit,setLimit]=useState(0)
  const pct=limit>0?Math.round(chars/limit*100):0
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Text</label>
            {limit>0&&<span className={'text-xs font-medium '+(pct>=100?'text-red-600':pct>=80?'text-amber-600':'text-gray-500')}>{chars}/{limit} ({pct}%)</span>}
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} className="w-full rounded border border-gray-300 px-3 py-2 resize-none" placeholder="Type or paste text here..."/>
          {limit>0&&<div className="h-1.5 mt-1 rounded-full bg-gray-200 overflow-hidden">
            <div className={'h-full rounded-full transition-all '+(pct>=100?'bg-red-500':pct>=80?'bg-amber-500':'bg-blue-500')} style={{width:Math.min(pct,100)+'%'}}/>
          </div>}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-600">Character limit:</label>
          <input type="number" min="0" value={limit||''} onChange={e=>setLimit(Number(e.target.value))} placeholder="No limit" className="w-28 rounded border border-gray-200 px-2 py-1 text-sm text-center"/>
          {[140,280,500,1000,2000].map(n=>(
            <button key={n} onClick={()=>setLimit(n)} className={'px-2 py-0.5 rounded border text-xs '+(limit===n?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50')}>{n}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {STATS.map(s=>(
            <div key={s.label} className={'rounded-xl p-3 text-center '+s.bg}>
              <p className={'text-xl font-bold '+s.color}>{s.val.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}