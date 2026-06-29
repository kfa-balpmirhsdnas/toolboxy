'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('json-to-yaml')!

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (obj === null) return 'null'
  if (obj === undefined) return ''
  if (typeof obj === 'boolean') return obj ? 'true' : 'false'
  if (typeof obj === 'number') return String(obj)
  if (typeof obj === 'string') {
    if (/[:\\#{}\[\],&*?|<>=!%@`]|^[\s]|[\s]$|^(true|false|null|yes|no|on|off)$/i.test(obj)) return '"' + obj.replace(/"/g,'\\"') + '"'
    return obj
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => {
      const v = jsonToYaml(item, indent+1)
      return pad + '- ' + (typeof item === 'object' && item !== null && !Array.isArray(item) ? '\n'+v : v)
    }).join('\n')
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj as Record<string,unknown>)
    if (keys.length === 0) return '{}'
    return keys.map(k => {
      const v = (obj as Record<string,unknown>)[k]
      const rendered = jsonToYaml(v, indent+1)
      if (typeof v === 'object' && v !== null) return pad + k + ':\n' + rendered
      return pad + k + ': ' + rendered
    }).join('\n')
  }
  return String(obj)
}

export default function JsonToYamlPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('{"name":"Alice","age":30,"hobbies":["reading","coding"],"address":{"city":"Seoul","country":"Korea"}}')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('json-to-yaml'); tracked.current = true } }

  let output = '', error = ''
  try {
    const parsed = JSON.parse(input)
    output = jsonToYaml(parsed)
  } catch(e:unknown) { error = e instanceof Error ? e.message : t('jm_invalid') }

  async function copy() { await navigator.clipboard.writeText(output); trackToolCopy('json-to-yaml'); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  function download() {
    const blob = new Blob([output],{type:'text/yaml'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='output.yaml'; a.click()
    trackToolDownload('json-to-yaml','yaml')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('jm_input')}</label>
          <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={14} placeholder='{"key": "value"}'
            className={'w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (error?'border-red-300':'border-gray-200')} />
          {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{t('jty_yamloutput')}</label>
            <div className="flex gap-2">
              {output && <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? <span className="inline-flex items-center gap-1"><ToolIcon name="check" className="w-3.5 h-3.5" />{t('ui_copied')}</span> : t('ui_copy')}</button>}
              {output && <button onClick={download} className="text-xs text-gray-500 hover:text-gray-700">{t('ui_download')}</button>}
            </div>
          </div>
          <pre className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono overflow-auto h-56">{output || <span className="text-gray-400 italic">{t('jty_placeholder')}</span>}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
