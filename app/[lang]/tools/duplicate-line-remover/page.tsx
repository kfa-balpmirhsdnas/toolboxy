'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='duplicate-line-remover')
  const [input,setInput]=useState('apple\nbanana\napple\norange\nbanana')
  const [cs,setCs]=useState(true)
  const [trim,setTrim]=useState(false)
  const lines=input.split('\n')
  const seen=new Set<string>()
  const out:string[]=[]
  for(const l of lines){
    const k=(cs?(trim?l.trim():l):(trim?l.trim():l).toLowerCase())
    if(!seen.has(k)){seen.add(k);out.push(l)}
  }
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-4 flex-wrap'>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={cs} onChange={e=>setCs(e.target.checked)}/>Case sensitive
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={trim} onChange={e=>setTrim(e.target.checked)}/>Trim whitespace
          </label>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Input ({lines.length} lines)</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-48 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Output ({out.length} lines, {lines.length-out.length} removed)
            </label>
            <textarea readOnly value={out.join('\n')}
              className='w-full h-48 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <button onClick={()=>navigator.clipboard.writeText(out.join('\n'))}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'>Copy</button>
      </div>
    </ToolLayout>
  )
}