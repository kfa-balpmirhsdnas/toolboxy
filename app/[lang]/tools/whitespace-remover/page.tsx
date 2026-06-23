'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='whitespace-remover')
  const [input,setInput]=useState('  Hello   World  \n  Extra   spaces  ')
  const [mode,setMode]=useState('trim')
  const [output,setOutput]=useState('')

  function process(){
    let result=input
    if(mode==='trim') result=input.split('\n').map(l=>l.trim()).join('\n')
    else if(mode==='collapse') result=input.replace(/[ \t]+/g,' ').split('\n').map(l=>l.trim()).join('\n')
    else if(mode==='all') result=input.replace(/\s+/g,' ').trim()
    else if(mode==='lines') result=input.split('\n').filter(l=>l.trim()).join('\n')
    else if(mode==='tabs') result=input.replace(/\t/g,' ')
    setOutput(result)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mode</label>
          <div className="flex flex-wrap gap-2">
            {[
              {val:'trim',label:'Trim Lines'},
              {val:'collapse',label:'Collapse Spaces'},
              {val:'all',label:'Remove All'},
              {val:'lines',label:'Remove Blank Lines'},
              {val:'tabs',label:'Tabs to Spaces'},
            ].map(({val,label})=>(
              <button key={val} onClick={()=>setMode(val)}
                className={"px-3 py-1.5 rounded text-sm border "+(mode===val?'bg-blue-600 text-white border-blue-600':'bg-white hover:bg-gray-50')}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              className="w-full h-40 p-3 border rounded font-mono text-sm resize-y"
              placeholder="Paste text with whitespace..."/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Output</label>
            <textarea readOnly value={output}
              className="w-full h-40 p-3 border rounded font-mono text-sm bg-gray-50 resize-y"/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={process}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Remove Whitespace
          </button>
          {output&&(
            <button onClick={()=>navigator.clipboard.writeText(output)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Copy Result
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
