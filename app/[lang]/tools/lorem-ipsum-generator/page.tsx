'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const WORDS='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim est laborum'.split(' ')

function words(n:number){
  const out:string[]=[]
  for(let i=0;i<n;i++) out.push(WORDS[i%WORDS.length])
  return out.join(' ')
}

function sentence(wordCount=8){
  const s=words(wordCount)
  return s.charAt(0).toUpperCase()+s.slice(1)+'.'
}

function paragraph(sentences=4){
  return Array.from({length:sentences},()=>sentence(6+Math.floor(Math.random()*6))).join(' ')
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='lorem-ipsum-generator')
  const [type,setType]=useState('paragraphs')
  const [count,setCount]=useState('3')
  const [output,setOutput]=useState('')

  function generate(){
    const n=parseInt(count)||1
    let result=''
    if(type==='words') result=words(n)
    else if(type==='sentences') result=Array.from({length:n},()=>sentence()).join(' ')
    else result=Array.from({length:n},()=>paragraph()).join('\n\n')
    setOutput(result)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)}
              className="border rounded px-3 py-2">
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Count</label>
            <input type="number" value={count} onChange={e=>setCount(e.target.value)}
              min="1" max="50" className="border rounded px-3 py-2 w-24"/>
          </div>
        </div>
        <button onClick={generate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate
        </button>
        {output&&(
          <div>
            <label className="block text-sm font-medium mb-1">Result</label>
            <textarea readOnly value={output}
              className="w-full h-48 p-3 border rounded text-sm bg-gray-50 resize-y"/>
            <button onClick={()=>navigator.clipboard.writeText(output)}
              className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Copy</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
