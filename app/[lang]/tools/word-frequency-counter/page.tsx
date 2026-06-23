'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='word-frequency-counter')
  const [input,setInput]=useState('')
  const [minLen,setMinLen]=useState(1)
  const [excludeCommon,setExcludeCommon]=useState(false)
  const COMMON=new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','it','this','that','are','was','were','be','have','has','had'])

  const words=input.toLowerCase().match(/[a-z]+/g)||[]
  const freq:Record<string,number>={}
  for(const w of words){
    if(w.length>=minLen&&(!excludeCommon||!COMMON.has(w)))
      freq[w]=(freq[w]||0)+1
  }
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1])

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          className='w-full h-36 p-3 border rounded font-mono text-sm resize-y'
          placeholder='Paste text to analyze word frequency...'/>
        <div className='flex gap-4 items-center flex-wrap'>
          <label className='flex items-center gap-2 text-sm'>
            Min word length:
            <input type='number' value={minLen} onChange={e=>setMinLen(Number(e.target.value))}
              min={1} max={10} className='border rounded px-2 py-1 w-16'/>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={excludeCommon} onChange={e=>setExcludeCommon(e.target.checked)}/>
            Exclude common words
          </label>
        </div>
        <div className='overflow-auto max-h-72'>
          <table className='w-full text-sm border-collapse'>
            <thead><tr className='bg-gray-100'>
              <th className='p-2 text-left border'>Rank</th>
              <th className='p-2 text-left border'>Word</th>
              <th className='p-2 text-right border'>Count</th>
              <th className='p-2 text-right border'>Frequency</th>
            </tr></thead>
            <tbody>
              {sorted.slice(0,50).map(([w,c],i)=>(
                <tr key={w} className='hover:bg-gray-50'>
                  <td className='p-2 border text-gray-400'>{i+1}</td>
                  <td className='p-2 border font-mono'>{w}</td>
                  <td className='p-2 border text-right'>{c}</td>
                  <td className='p-2 border text-right'>{words.length?((c/words.length)*100).toFixed(1)+'%':'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className='text-xs text-gray-400'>Total: {words.length} words | {sorted.length} unique</p>
      </div>
    </ToolLayout>
  )
}