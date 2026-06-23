'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function encode(s:string):string{
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}
function decode(s:string):string{
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'")
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='html-entity-encoder')
  const [input,setInput]=useState('<div class="hello">Hello & World</div>')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const output=mode==='encode'?encode(input):decode(input)
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          {(['encode','decode'] as const).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={'px-4 py-2 rounded text-sm '+(mode===m?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200')}>
              {m==='encode'?'Encode':'Decode'}
            </button>
          ))}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-40 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Output</label>
            <textarea readOnly value={output}
              className='w-full h-40 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <button onClick={()=>navigator.clipboard.writeText(output)}
          className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm'>Copy</button>
      </div>
    </ToolLayout>
  )
}