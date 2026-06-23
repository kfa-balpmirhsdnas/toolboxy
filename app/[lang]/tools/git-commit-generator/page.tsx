'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const TYPES=['feat','fix','docs','style','refactor','perf','test','chore','build','ci']

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='git-commit-generator')
  const [type,setType]=useState('feat')
  const [scope,setScope]=useState('')
  const [subject,setSubject]=useState('')
  const [body,setBody]=useState('')
  const [breaking,setBreaking]=useState(false)
  const [copied,setCopied]=useState(false)

  const commit=[
    type+(scope?'('+scope+')':'')+(breaking?'!':'')+': '+subject,
    body?'\n'+body:'',
  ].filter(Boolean).join('\n').trim()

  function copy(){
    navigator.clipboard.writeText(commit)
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4 max-w-xl">
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)}
              className="border rounded px-3 py-2">
              {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-sm font-medium mb-1">Scope (optional)</label>
            <input value={scope} onChange={e=>setScope(e.target.value)}
              placeholder="e.g. auth, api"
              className="w-full border rounded px-3 py-2"/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)}
            placeholder="Short description (imperative mood)"
            className="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Body (optional)</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)}
            className="w-full h-24 p-3 border rounded text-sm resize-y"
            placeholder="Detailed description..."/>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={breaking} onChange={e=>setBreaking(e.target.checked)}/>
          Breaking change (!)
        </label>
        {subject&&(
          <div>
            <label className="block text-sm font-medium mb-1">Generated Commit Message</label>
            <pre className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm whitespace-pre-wrap">{commit}</pre>
            <button onClick={copy}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {copied?'Copied!':'Copy'}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
