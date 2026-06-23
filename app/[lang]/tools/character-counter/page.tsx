'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='character-counter')
  const [text,setText]=useState('')

  const chars=text.length
  const charsNoSpace=text.replace(/\s/g,'').length
  const words=text.trim()===''?0:text.trim().split(/\s+/).length
  const lines=text===''?0:text.split('\n').length
  const sentences=text===''?0:(text.match(/[.!?]+/g)||[]).length
  const paragraphs=text===''?0:text.split(/\n\s*\n/).filter(p=>p.trim()).length

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <textarea
          className="w-full h-48 p-3 border rounded font-mono text-sm resize-y"
          placeholder="Type or paste text here..."
          value={text}
          onChange={e=>setText(e.target.value)}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {label:'Characters',val:chars},
            {label:'No Spaces',val:charsNoSpace},
            {label:'Words',val:words},
            {label:'Lines',val:lines},
            {label:'Sentences',val:sentences},
            {label:'Paragraphs',val:paragraphs},
          ].map(({label,val})=>(
            <div key={label} className="bg-gray-50 border rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{val.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        {text&&(
          <button onClick={()=>setText('')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Clear
          </button>
        )}
      </div>
    </ToolLayout>
  )
}
