'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('git-commit-generator')!
const TYPES=[
  {type:'feat',icon:'✨',desc:'A new feature'},
  {type:'fix',icon:'🐛',desc:'A bug fix'},
  {type:'docs',icon:'📝',desc:'Documentation only changes'},
  {type:'style',icon:'💄',desc:'Changes that do not affect meaning (formatting)'},
  {type:'refactor',icon:'♻️',desc:'Neither fixes a bug nor adds a feature'},
  {type:'perf',icon:'⚡️',desc:'A code change that improves performance'},
  {type:'test',icon:'✅',desc:'Adding or fixing tests'},
  {type:'chore',icon:'🔧',desc:'Changes to build process or tools'},
  {type:'ci',icon:'👷',desc:'Changes to CI configuration files'},
  {type:'revert',icon:'⏪',desc:'Reverts a previous commit'},
]
export default function GitCommitGeneratorPage() {
  const [type,setType]=useState('feat')
  const [scope,setScope]=useState('')
  const [breaking,setBreaking]=useState(false)
  const [desc,setDesc]=useState('')
  const [body,setBody]=useState('')
  const [footer,setFooter]=useState('')
  const [emoji,setEmoji]=useState(true)
  const selType=TYPES.find(t=>t.type===type)!
  const commit=[
    (emoji?selType.icon+' ':'')+type+(scope?'('+scope+')':'')+(breaking?'!':'')+': '+desc,
    body?'
'+body:'',
    footer?'
BREAKING CHANGE: '+footer:'',
  ].filter(Boolean).join('')
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(commit);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Commit type</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
            {TYPES.map(t=>(
              <button key={t.type} onClick={()=>setType(t.type)} title={t.desc}
                className={'py-2 rounded-lg border text-xs font-medium transition '+(type===t.type?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50')}>
                {emoji?t.icon+' ':''}{t.type}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{selType.desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Scope (optional)</label>
            <input value={scope} onChange={e=>setScope(e.target.value)} placeholder="e.g. auth, api, ui" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"/></div>
          <div className="flex items-end gap-3 pb-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={breaking} onChange={e=>setBreaking(e.target.checked)} className="rounded"/>
              Breaking change (!)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={emoji} onChange={e=>setEmoji(e.target.checked)} className="rounded"/>
              Emoji
            </label>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-400">*</span></label>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Short description of the change" maxLength={72} className="w-full rounded border border-gray-300 px-3 py-2"/>
          <p className="text-xs text-gray-400 mt-0.5">{desc.length}/72 chars</p></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Body (optional)</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Longer description..." className="w-full rounded border border-gray-300 px-3 py-2 text-sm resize-none"/></div>
        {breaking&&<div><label className="block text-xs font-medium text-gray-600 mb-1">Breaking change description</label>
          <input value={footer} onChange={e=>setFooter(e.target.value)} placeholder="Describe what broke and how to migrate" className="w-full rounded border border-gray-300 px-3 py-2 text-sm"/></div>}
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Generated commit message</span>
            <button onClick={copy} className="text-xs text-blue-400 hover:text-blue-300">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap break-all">{commit||'Fill in the fields above...'}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}