'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('curl-builder')!

type Method = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD'|'OPTIONS'

interface Header { key: string; value: string; enabled: boolean }
interface Param  { key: string; value: string; enabled: boolean }

export default function CurlBuilderPage({ params }: { params: { lang: string } }) {
  const [url, setUrl] = useState('https://api.example.com/users')
  const [method, setMethod] = useState<Method>('GET')
  const [headers, setHeaders] = useState<Header[]>([
    { key:'Content-Type', value:'application/json', enabled:true },
    { key:'Authorization', value:'Bearer YOUR_TOKEN', enabled:false },
  ])
  const [params, setParams] = useState<Param[]>([
    { key:'page', value:'1', enabled:true },
    { key:'limit', value:'20', enabled:true },
  ])
  const [body, setBody] = useState('')
  const [bodyType, setBodyType] = useState<'none'|'json'|'form'|'raw'>('none')
  const [followRedirect, setFollowRedirect] = useState(true)
  const [verbose, setVerbose] = useState(false)
  const [insecure, setInsecure] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('curl-builder'); tracked.current = true } }

  function updateHeader(i: number, field: keyof Header, val: string|boolean) {
    setHeaders(h=>{const n=[...h];n[i]={...n[i],[field]:val};return n}); track()
  }
  function addHeader() { setHeaders(h=>[...h,{key:'',value:'',enabled:true}]) }
  function removeHeader(i: number) { setHeaders(h=>h.filter((_,idx)=>idx!==i)) }
  function updateParam(i: number, field: keyof Param, val: string|boolean) {
    setParams(p=>{const n=[...p];n[i]={...n[i],[field]:val};return n}); track()
  }
  function addParam() { setParams(p=>[...p,{key:'',value:'',enabled:true}]) }
  function removeParam(i: number) { setParams(p=>p.filter((_,idx)=>idx!==i)) }

  function buildCurl(): string {
    const parts = ['curl']
    if (verbose) parts.push('-v')
    if (insecure) parts.push('-k')
    if (followRedirect) parts.push('-L')
    parts.push('-X', method)
    
    const activeHeaders = headers.filter(h=>h.enabled&&h.key)
    for (const h of activeHeaders) parts.push('-H', JSON.stringify(h.key+': '+h.value))
    
    const activeParams = params.filter(p=>p.enabled&&p.key)
    let finalUrl = url
    if (activeParams.length) {
      const qs = activeParams.map(p=>encodeURIComponent(p.key)+'='+encodeURIComponent(p.value)).join('&')
      finalUrl += (url.includes('?')?'&':'?')+qs
    }
    
    if (bodyType==='json' && body) parts.push('-d', JSON.stringify(body))
    else if (bodyType==='form' && body) {
      const formData = body.split('\n').filter(l=>l.includes('=')).map(l=>'-F '+JSON.stringify(l.trim()))
      parts.push(...formData.flatMap(f=>f.split(' ')))
    } else if (bodyType==='raw' && body) parts.push('-d', JSON.stringify(body))
    
    parts.push(JSON.stringify(finalUrl))
    return parts.join(' ')
  }

  const curl = buildCurl()

  async function copy() {
    await navigator.clipboard.writeText(curl)
    trackToolCopy('curl-builder')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <select value={method} onChange={e=>{setMethod(e.target.value as Method);track()}}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
            {(['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'] as Method[]).map(m=><option key={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e=>{setUrl(e.target.value);track()}} placeholder="https://api.example.com/endpoint"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Query Parameters</label>
            <button onClick={addParam} className="text-xs text-brand-600 hover:underline">+ Add</button>
          </div>
          {params.map((p,i)=>(
            <div key={i} className="flex gap-2 mb-1 items-center">
              <input type="checkbox" checked={p.enabled} onChange={e=>updateParam(i,'enabled',e.target.checked)} className="accent-brand-600" />
              <input value={p.key} onChange={e=>updateParam(i,'key',e.target.value)} placeholder="Key"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none" />
              <input value={p.value} onChange={e=>updateParam(i,'value',e.target.value)} placeholder="Value"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none" />
              <button onClick={()=>removeParam(i)} className="text-red-400 hover:text-red-600 text-sm">\u00D7</button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Headers</label>
            <button onClick={addHeader} className="text-xs text-brand-600 hover:underline">+ Add</button>
          </div>
          {headers.map((h,i)=>(
            <div key={i} className="flex gap-2 mb-1 items-center">
              <input type="checkbox" checked={h.enabled} onChange={e=>updateHeader(i,'enabled',e.target.checked)} className="accent-brand-600" />
              <input value={h.key} onChange={e=>updateHeader(i,'key',e.target.value)} placeholder="Header name"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none" />
              <input value={h.value} onChange={e=>updateHeader(i,'value',e.target.value)} placeholder="Value"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none" />
              <button onClick={()=>removeHeader(i)} className="text-red-400 hover:text-red-600 text-sm">\u00D7</button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex gap-2 mb-2">
            {(['none','json','form','raw'] as const).map(bt=>(
              <button key={bt} onClick={()=>{setBodyType(bt);track()}}
                className={'px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ' + (bodyType===bt?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>
                {bt}
              </button>
            ))}
          </div>
          {bodyType!=='none' && (
            <textarea value={body} onChange={e=>{setBody(e.target.value);track()}} rows={3} placeholder={bodyType==='json'?'{"key":"value"}':bodyType==='form'?'key=value':'Raw body'}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none resize-none" />
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {[['Follow redirects (-L)',followRedirect,setFollowRedirect],['Verbose (-v)',verbose,setVerbose],['Skip SSL verify (-k)',insecure,setInsecure]].map(([label,val,set])=>(
            <label key={label as string} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={val as boolean} onChange={e=>{(set as (v:boolean)=>void)(e.target.checked);track()}} className="accent-brand-600" />
              {label as string}
            </label>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Generated cURL</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy'}</button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono whitespace-pre-wrap break-all">{curl}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
