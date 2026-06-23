'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='number-sorter')
  const [input,setInput]=useState('42\n7\n15\n3\n99\n1')
  const [order,setOrder]=useState<'asc'|'desc'>('asc')
  const [sep,setSep]=useState<'newline'|'comma'|'space'>('newline')
  const [output,setOutput]=useState('')

  function sort(){
    const delim=sep==='comma'?',':sep==='space'?' ':'\n'
    const nums=input.split(delim).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n))
    nums.sort((a,b)=>order==='asc'?a-b:b-a)
    setOutput(nums.join(delim))
  }

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='flex gap-4 flex-wrap'>
          <div>
            <label className='block text-sm font-medium mb-1'>Separator</label>
            <select value={sep} onChange={e=>setSep(e.target.value as 'newline'|'comma'|'space')}
              className='border rounded px-3 py-2'>
              <option value='newline'>Newline</option>
              <option value='comma'>Comma</option>
              <option value='space'>Space</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Order</label>
            <div className='flex gap-2'>
              {(['asc','desc'] as const).map(o=>(
                <button key={o} onClick={()=>setOrder(o)}
                  className={'px-3 py-2 rounded border '+(order===o?'bg-blue-600 text-white':'bg-white hover:bg-gray-50')}>
                  {o==='asc'?'Ascending':'Descending'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Numbers</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-36 p-3 border rounded font-mono text-sm resize-y'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Sorted</label>
            <textarea readOnly value={output}
              className='w-full h-36 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <div className='flex gap-3'>
          <button onClick={sort} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Sort</button>
          {output&&<button onClick={()=>navigator.clipboard.writeText(output)} className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>Copy</button>}
        </div>
      </div>
    </ToolLayout>
  )
}