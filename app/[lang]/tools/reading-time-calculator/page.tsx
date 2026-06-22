'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const WPM_PROFILES = [
  {label:'Slow (150 wpm)',wpm:150},
  {label:'Average (238 wpm)',wpm:238},
  {label:'Fast (350 wpm)',wpm:350},
  {label:'Speed Reader (700 wpm)',wpm:700},
]

function formatTime(minutes:number):string {
  if(minutes<1) return Math.round(minutes*60)+' seconds'
  const h=Math.floor(minutes/60), m=Math.round(minutes%60)
  if(h===0) return m+' minute'+(m!==1?'s':'')
  return h+' hour'+(h!==1?'s':'')+' '+(m>0?m+' min':'')
}


const tool = getToolBySlug('reading-time-calculator')!

export default function ReadingTimeCalculatorPage() {
  const [text, setText] = useState('')
  const [wpmIdx, setWpmIdx] = useState(1)

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const sentences = text.split(/[.!?]+/).filter(s=>s.trim().length>0).length
  const paragraphs = text.split(/\n\n+/).filter(p=>p.trim().length>0).length
  const wpm = WPM_PROFILES[wpmIdx].wpm
  const readMin = words/wpm

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading Time Calculator</h1>
        <p className="text-gray-500 mb-8">Estimate how long it takes to read any text</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste Your Text</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={10}
              placeholder="Paste an article, blog post, or any text here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reading Speed</label>
            <div className="flex flex-wrap gap-2">
              {WPM_PROFILES.map((p,i)=>(
                <button key={i} onClick={()=>setWpmIdx(i)}
                  className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors '+(wpmIdx===i?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {words > 0 && (
          <div className="mt-6 space-y-4">
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-600">{formatTime(readMin)}</div>
              <div className="text-gray-500 mt-1">estimated reading time</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([['Words', words.toLocaleString()],['Characters',chars.toLocaleString()],['Sentences',sentences.toLocaleString()],['Paragraphs',paragraphs.toLocaleString()]] as [string,string][]).map(([label,val])=>(
                <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gray-800">{val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Reading Times at Different Speeds</h2>
              <div className="space-y-2">
                {WPM_PROFILES.map((p,i)=>(
                  <div key={i} className={'flex items-center justify-between px-3 py-2 rounded-lg '+(wpmIdx===i?'bg-brand-50 border border-brand-100':'')}>
                    <span className="text-sm text-gray-600">{p.label}</span>
                    <span className={'font-semibold text-sm '+(wpmIdx===i?'text-brand-600':'text-gray-700')}>{formatTime(words/p.wpm)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}