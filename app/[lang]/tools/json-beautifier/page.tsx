'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='json-beautifier')
  const [input,setInput]=useState('{"name":"Alice","age":30,"tags":["dev","designer"]}')
  const [output,setOutput]=useState('')
  const [error,setError]=useState('')
  const [indent,setIndent]=useState(2)

  function format(){
    try{
      const parsed=JSON.parse(input)
      setOutput(JSON.stringify(parsed,null,indent))
      setError('')
    }catch(e){
      setError('Invalid JSON: '+(e as Error).message)
    }
  }
  function minify(){
    try{
      setOutput(JSON.stringify(JSON.parse(input)))
      setError('')
    }catch(e){
      setError('Invalid JSON: '+(e as Error).message)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-3 items-center flex-wrap'>
          <div>
            <label className='text-sm font-medium mr-2'>Indent:</label>
            <select value={indent} onChange={e=>setIndent(Number(e.target.value))} className='border rounded px-2 py-1'>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
          <button onClick={format} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Format</button>
          <button onClick={minify} className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>Minify</button>
        </div>
        {error&&<p className='text-red-500 text-sm'>{error}</p>}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-64 p-3 border rounded font-mono text-sm resize-y'
              placeholder='Paste JSON...'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Output</label>
            <textarea readOnly value={output}
              className='w-full h-64 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        {output&&<button onClick={()=>navigator.clipboard.writeText(output)}
          className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm'>Copy</button>}
      </div>
    </ToolLayout>
  )
}