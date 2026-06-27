'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('url-parser')!
const SAMPLES=['https://www.example.com/path/to/page?name=Alice&age=30&city=New+York#section-2','https://api.github.com/repos/owner/repo/issues?state=open&labels=bug,help+wanted&per_page=30','ftp://user:password@files.example.net:21/downloads/file.zip?v=2#chunk1']
export default function UrlParserPage() {
  const t = useTranslations('toolui')
  const [url,setUrl]=useState(SAMPLES[0])
  const [copied,setCopied]=useState('')
  const parse=(u:string)=>{
    try{
      const p=new URL(u)
      const params:Array<[string,string]>=[...p.searchParams.entries()]
      return{
        protocol:p.protocol.slice(0,-1),username:p.username,password:p.password,
        host:p.host,hostname:p.hostname,port:p.port,
        pathname:p.pathname,search:p.search,hash:p.hash,
        params,origin:p.origin,href:p.href,error:''
      }
    }catch(e){return{protocol:'',username:'',password:'',host:'',hostname:'',port:'',pathname:'',search:'',hash:'',params:[],origin:'',href:u,error:String(e)}}
  }
  const p=parse(url)
  const copy=(v:string)=>{if(v){navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1200)}}
  const Row=({label,value}:{label:string;value:string})=>value?(
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="w-24 flex-shrink-0 text-xs font-medium text-gray-500 mt-0.5">{label}</span>
      <code className="flex-1 text-xs font-mono text-gray-800 break-all">{value}</code>
      <button onClick={()=>copy(value)} className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700">{copied===value?'✓':t('ui_copy')}</button>
    </div>
  ):null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input value={url} onChange={e=>setUrl(e.target.value)} type="url"
            className={'w-full rounded-xl border px-3 py-2.5 font-mono text-sm focus:outline-none '+(p.error?'border-red-300 bg-red-50':'border-gray-300 focus:border-blue-400')}
            placeholder="https://example.com/path?query=value#hash"/>
          {p.error&&<p className="text-red-500 text-xs mt-1">{p.error}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLES.map((s,i)=>(
            <button key={i} onClick={()=>setUrl(s)} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">{t('up_sample')} {i+1}</button>
          ))}
        </div>
        {!p.error&&(
          <div className="bg-gray-50 rounded-xl p-4 divide-y divide-gray-100">
            <Row label="Protocol" value={p.protocol}/>
            <Row label="Username" value={p.username}/>
            <Row label="Password" value={p.password}/>
            <Row label="Host" value={p.host}/>
            <Row label="Hostname" value={p.hostname}/>
            <Row label="Port" value={p.port}/>
            <Row label="Pathname" value={p.pathname}/>
            <Row label="Search" value={p.search}/>
            <Row label="Hash" value={p.hash}/>
            <Row label="Origin" value={p.origin}/>
            {p.params.length>0&&(
              <div className="pt-2">
                <p className="text-xs font-medium text-gray-600 mb-2">{t('up_params',{n:p.params.length})}</p>
                <div className="space-y-1">
                  {p.params.map(([k,v],i)=>(
                    <div key={i} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                      <span className="font-medium text-blue-600 w-24 truncate">{k}</span>
                      <span className="text-gray-400">=</span>
                      <span className="font-mono text-gray-700 flex-1 truncate">{decodeURIComponent(v)}</span>
                      <button onClick={()=>copy(v)} className="text-blue-400 hover:text-blue-600">{copied===v?'✓':t('ui_copy')}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}