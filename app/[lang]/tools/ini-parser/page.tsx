'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('ini-parser')!

type IniData = Record<string, Record<string,string>>

function parseIni(text: string): IniData {
  const result: IniData = {}
  let section = 'global'
  result[section] = {}
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith(';') || line.startsWith('#')) continue
    if (line.startsWith('[') && line.endsWith(']')) {
      section = line.slice(1,-1).trim()
      if (!result[section]) result[section] = {}
    } else {
      const eq = line.indexOf('=')
      if (eq > 0) {
        const k = line.slice(0,eq).trim()
        const v = line.slice(eq+1).trim().replace(/^["']|["']$/g,'')
        result[section][k] = v
      }
    }
  }
  if (Object.keys(result['global']).length === 0) delete result['global']
  return result
}

const SAMPLE = `; Database configuration
[database]
host = localhost
port = 5432
name = myapp
user = admin

[server]
host = 0.0.0.0
port = 8080
debug = true
log_level = info

[cache]
driver = redis
ttl = 3600
`

export default function IniParserPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState(SAMPLE)
  const [view, setView] = useState<'table'|'json'>('table')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('ini-parser'); tracked.current = true } }

  let parsed: IniData = {}
  let parseError = ''
  try { parsed = parseIni(input) } catch(e: unknown) { parseError = e instanceof Error ? e.message : 'Error' }

  const jsonStr = JSON.stringify(parsed, null, 2)

  async function copy() {
    await navigator.clipboard.writeText(jsonStr)
    trackToolCopy('ini-parser')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={8} placeholder="Paste INI content..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {parseError && <p className="text-xs text-red-600">{parseError}</p>}
        <div className="flex gap-2 items-center">
          {(['table','json'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ' + (view===v?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {v.toUpperCase()}
            </button>
          ))}
          <button onClick={copy} className="ml-auto text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy JSON'}</button>
        </div>
        {view === 'table' ? (
          <div className="space-y-3">
            {Object.entries(parsed).map(([sec, vals])=>(
              <div key={sec}>
                <h3 className="text-xs font-semibold text-brand-600 mb-1">[{sec}]</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {Object.entries(vals).map(([k,v],i)=>(
                    <div key={k} className={'flex gap-0 ' + (i%2===0?'bg-white':'bg-gray-50')}>
                      <div className="px-3 py-2 text-xs font-mono font-medium text-gray-700 w-40 border-r border-gray-200">{k}</div>
                      <div className="px-3 py-2 text-xs font-mono text-gray-600 flex-1">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-auto max-h-64">{jsonStr}</pre>
        )}
      </div>
    </ToolLayout>
  )
}
