'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const TYPES=['feat','fix','docs','style','refactor','perf','test','chore','build','ci']

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='git-commit-generator')
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
            <label className="block text-sm font-medium mb-1">{t('lip_type')}</label>
            <select value={type} onChange={e=>setType(e.target.value)}
              className="border rounded px-3 py-2">
              {TYPES.map(ty=><option key={ty} value={ty}>{ty}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-sm font-medium mb-1">{t('gcg_scope')}</label>
            <input value={scope} onChange={e=>setScope(e.target.value)}
              placeholder="e.g. auth, api"
              className="w-full border rounded px-3 py-2"/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('gcg_subject')}</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)}
            placeholder={t('gcg_subject_ph')}
            className="w-full border rounded px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('eqr_body')}</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)}
            className="w-full h-24 p-3 border rounded text-sm resize-y"
            placeholder={t('gcg_body_ph')}/>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={breaking} onChange={e=>setBreaking(e.target.checked)}/>
          {t('gcg_breaking')}
        </label>
        {subject&&(
          <div>
            <label className="block text-sm font-medium mb-1">{t('gcg_generated')}</label>
            <pre className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm whitespace-pre-wrap">{commit}</pre>
            <button onClick={copy}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {copied?t('ui_copied'):t('ui_copy')}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
