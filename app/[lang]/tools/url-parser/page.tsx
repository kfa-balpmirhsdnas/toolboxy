'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('url-parser')!
export default function UrlParserPage() {
  const [url,setUrl]=useState('https://example.com:8080/path/page?foo=bar&baz=qux#section')
  const [copied,setCopied]=useState('')
  let parsed:{[k:string]:string}={}
  let params:{[k:string]:string}={}
  let parseErr=false
  try {
    const u=new URL(url)
    parsed={
      'Protocol':u.protocol,
      'Hostname':u.hostname,
      'Port':u.port||'(default)',
      'Pathname':u.pathname,
      'Search':u.search||'(none)',
      'Hash':u.hash||'(none)',
      'Origin':u.origin,
      'Host':u.host,
    }
    u.searchParams.forEach((v,k)=>{params[k]=v})
  } catch {parseErr=true}
  const copy=(val:string,k:string)=>{navigator.clipboard.writeText(val);setCopied(k);setTimeout(()=>setCopied(''),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL to parse</label>
          <input value={url} onChange={e=>setUrl(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm" placeholder="https://..."/>
        </div>
        {parseErr&&url&&<p className="text-red-500 text-sm">Invalid URL — include http:// or https://</p>}
        {!parseErr&&url&&(
          <>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              {Object.entries(parsed).map(([k,v])=>(
                <div key={k} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">{k}</span>
                  <span className="font-mono text-sm text-gray-800 flex-1 truncate mx-2">{v}</span>
                  <button onClick={()=>copy(v,k)} className="text-xs text-blue-500 hover:underline flex-shrink-0">
                    {copied===k?'✓':'Copy'}
                  </button>
                </div>
              ))}
            </div>
            {Object.keys(params).length>0&&(
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Query Parameters</p>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  {Object.entries(params).map(([k,v])=>(
                    <div key={k} className="flex items-center px-4 py-2.5 gap-3">
                      <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{k}</span>
                      <span className="font-mono text-sm text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}