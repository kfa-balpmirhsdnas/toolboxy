'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { getToolBySlug } from '@/lib/tools/registry'

function toXmlTag(key: string): string {
  return key.replace(/[^a-zA-Z0-9_.-]/g,'_').replace(/^[^a-zA-Z_]/,'_$&') || 'item'
}

function jsonToXml(obj: unknown, indent: number, key: string): string {
  const pad = '  '.repeat(indent)
  const tag = toXmlTag(key)
  if (obj === null || obj === undefined) return pad+'<'+tag+'/>'
  if (typeof obj !== 'object') {
    const val = String(obj).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    return pad+'<'+tag+'>'+val+'</'+tag+'>'
  }
  if (Array.isArray(obj)) {
    if (!obj.length) return pad+'<'+tag+'/>'
    return pad+'<'+tag+'>\n'+obj.map(i=>jsonToXml(i,indent+1,'item')).join('\n')+'\n'+pad+'</'+tag+'>'
  }
  const entries = Object.entries(obj as Record<string,unknown>)
  if (!entries.length) return pad+'<'+tag+'/>'
  return pad+'<'+tag+'>\n'+entries.map(([k,v])=>jsonToXml(v,indent+1,k)).join('\n')+'\n'+pad+'</'+tag+'>'
}

const SAMPLE = `{
  "person": {
    "name": "Alice",
    "age": 30,
    "active": true,
    "hobbies": ["reading","coding"],
    "address": { "city": "Seoul", "country": "Korea" }
  }
}`


const tool = getToolBySlug('json-to-xml')!

export default function JsonToXml() {
  const t = useTranslations('toolui')
  const [input, setInput] = useState(SAMPLE)
  const [rootTag, setRootTag] = useState('root')
  const [copied, setCopied] = useState(false)
  let xml = '', error = ''
  try {
    const parsed = JSON.parse(input)
    const inner = typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.entries(parsed as Record<string,unknown>).map(([k,v])=>jsonToXml(v,1,k)).join('\n')
      : jsonToXml(parsed,1,'item')
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<'+rootTag+'>\n'+inner+'\n</'+rootTag+'>'
  } catch(e) { if(input.trim()) error = t('jm_invalid')+': '+(e as Error).message }
  const copy = async () => { if(!xml) return; await navigator.clipboard.writeText(xml); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('jtx_title')}</h1>
        <p className="text-gray-500 mb-8">{t('jtx_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('jtx_root')}</label>
          <input type="text" value={rootTag} onChange={e=>setRootTag(e.target.value||'root')} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40 font-mono"/>
          <button onClick={()=>setInput(SAMPLE)} className="ml-auto text-sm text-gray-400 hover:text-gray-600">{t('jtx_loadexample')}</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">{t('jm_input')}</span>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-5 font-mono text-sm resize-none focus:outline-none rounded-b-2xl" rows={20} placeholder='{"key":"value"}' spellCheck={false}/>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">{t('jtx_xmloutput')}</span>
              <button onClick={copy} disabled={!xml} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-40">
                {copied?'✓ '+t('ui_copied'):t('jtx_copyxml')}
              </button>
            </div>
            <pre className="flex-1 p-5 text-xs font-mono overflow-auto text-gray-700 whitespace-pre-wrap">
              {xml||(error?t('jtx_fixerrors'):t('ui_output_ph'))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}