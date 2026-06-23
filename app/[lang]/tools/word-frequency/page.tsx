'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='word-frequency')
  const [input,setInput]=useState('the quick brown fox jumps over the lazy dog the fox')
  const [top,setTop]=useState(10)
  const [caseSensitive,setCaseSensitive]=useState(false)

  const text=caseSensitive?input:input.toLowerCase()
  const words=text.match(/[a-zA-Z]+/g)||[]
  const freq:Record<string,number>={}
  for(const w of words) freq[w]=(freq[w]||0)+1
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,top)
  const maxCount=sorted[0]?.[1]||1

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          className='w-full h-32 p-3 border rounded font-mono text-sm resize-y'
          placeholder='Paste your text here...'/>
        <div className='flex gap-4 items-center flex-wrap'>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)}/>
            Case sensitive
          </label>
          <label className='flex items-center gap-2 text-sm'>
            Show top
            <select value={top} onChange={e=>setTop(Number(e.target.value))} className='border rounded px-2 py-1'>
              {[10,20,30,50].map(n=>(<option key={n} value={n}>{n}</option>))}
            </select>
            words
          </label>
        </div>
        <div className='space-y-1'>
          {sorted.map(([word,count],i)=>(
            <div key={word} className='flex items-center gap-2'>
              <span className='text-gray-400 text-xs w-5'>{i+1}</span>
              <span className='font-mono text-sm w-24 truncate'>{word}</span>
              <div className='flex-1 bg-gray-100 rounded h-5'>
                <div className='bg-blue-500 h-5 rounded' style={{width:(count/maxCount*100)+'%'}}/>
              </div>
              <span className='text-sm text-gray-600 w-8 text-right'>{count}</span>
            </div>
          ))}
        </div>
        <p className='text-xs text-gray-400'>Total words: {words.length} | Unique: {Object.keys(freq).length}</p>
      </div>
    </ToolLayout>
  )
}