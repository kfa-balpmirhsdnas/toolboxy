'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function convert(html:string):string{
  let s=html
  s=s.replace(/<h1[^>]*>(.*?)<\/h1>/gis,'# $1\n')
  s=s.replace(/<h2[^>]*>(.*?)<\/h2>/gis,'## $1\n')
  s=s.replace(/<h3[^>]*>(.*?)<\/h3>/gis,'### $1\n')
  s=s.replace(/<strong[^>]*>(.*?)<\/strong>/gis,'**$1**')
  s=s.replace(/<b[^>]*>(.*?)<\/b>/gis,'**$1**')
  s=s.replace(/<em[^>]*>(.*?)<\/em>/gis,'*$1*')
  s=s.replace(/<i[^>]*>(.*?)<\/i>/gis,'*$1*')
  s=s.replace(/<code[^>]*>(.*?)<\/code>/gis,'`$1`')
  s=s.replace(/<a[^>]*href=['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gis,'[$2]($1)')
  s=s.replace(/<li[^>]*>(.*?)<\/li>/gis,'- $1\n')
  s=s.replace(/<\/?(ul|ol)[^>]*>/gis,'')
  s=s.replace(/<p[^>]*>(.*?)<\/p>/gis,'$1\n\n')
  s=s.replace(/<br\s*\/?>/gis,'  \n')
  s=s.replace(/<[^>]+>/g,'')
  s=s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
  s=s.replace(/&quot;/g,'"').replace(/&#39;/g,"'")
  return s.replace(/\n{3,}/g,'\n\n').trim()
}

const DEMO='<h1>Title</h1><p>This is <strong>bold</strong> and <em>italic</em>.</p><ul><li>Item 1</li><li>Item 2</li></ul>'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='html-to-markdown')
  const [input,setInput]=useState(DEMO)
  const [output,setOutput]=useState('')
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>HTML Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className='w-full h-48 p-3 border rounded font-mono text-sm resize-y'
              placeholder='Paste HTML here...'/>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Markdown Output</label>
            <textarea readOnly value={output}
              className='w-full h-48 p-3 border rounded font-mono text-sm bg-gray-50 resize-y'/>
          </div>
        </div>
        <div className='flex gap-3'>
          <button onClick={()=>setOutput(convert(input))}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
            Convert
          </button>
          {output&&<button onClick={()=>navigator.clipboard.writeText(output)}
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>Copy</button>}
        </div>
      </div>
    </ToolLayout>
  )
}