'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('character-counter')!
export default function CharacterCounterPage() {
  const [text,setText]=useState('The quick brown fox jumps over the lazy dog.')
  const chars=text.length
  const charsNoSpaces=text.replace(/\s/g,'').length
  const words=text.trim()?text.trim().split(/\s+/).length:0
  const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length
  const paragraphs=text.split(/\n\n+/).filter(p=>p.trim()).length||1
  const lines=text.split('\n').length
  return (<ToolLayout tool={tool}><div className="max-w-2xl mx-auto px-4 space-y-4"><textarea value={text} onChange={e=>setText(e.target.value)} rows={8} className="w-full p-3 border rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type or paste your text here..."/><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[{label:'Characters',value:chars},{label:'Without spaces',value:charsNoSpaces},{label:'Words',value:words},{label:'Sentences',value:sentences},{label:'Paragraphs',value:paragraphs},{label:'Lines',value:lines}].map(({label,value})=>(<div key={label} className="bg-gray-50 border rounded-lg p-4 text-center"><div className="text-2xl font-bold text-blue-600">{value}</div><div className="text-sm text-gray-600 mt-1">{label}</div></div>))}</div></div></ToolLayout>)
}