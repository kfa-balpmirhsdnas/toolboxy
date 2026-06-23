'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='reading-time-estimator')
  const [text,setText]=useState('Paste your article here to estimate reading time.')
  const [wpm,setWpm]=useState(200)
  const words=text.trim().split(/\s+/).filter(w=>w.length>0)
  const minutes=words.length/wpm
  const secs=Math.round(minutes*60)
  const display=secs<60?secs+'s':
    Math.floor(secs/60)+'m '+(secs%60)+'s'
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <label className='text-sm'>Reading speed (WPM):</label>
          <input type='number' value={wpm} onChange={e=>setWpm(Number(e.target.value))}
            className='border rounded px-3 py-1 w-24' min={50} max={1000}/>
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)}
          className='w-full h-48 p-3 border rounded text-sm resize-y'
          placeholder='Paste your text here...'/>
        <div className='grid grid-cols-3 gap-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>{display}</div>
            <div className='text-xs text-gray-500 mt-1'>Reading Time</div>
          </div>
          <div className='bg-gray-50 border rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold'>{words.length}</div>
            <div className='text-xs text-gray-500 mt-1'>Words</div>
          </div>
          <div className='bg-gray-50 border rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold'>{text.length}</div>
            <div className='text-xs text-gray-500 mt-1'>Characters</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}