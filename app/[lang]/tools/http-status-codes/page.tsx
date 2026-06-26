'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('http-status-codes')!
const CODES:{code:number;name:string;desc:string;cat:string}[]=[
  {code:100,name:'Continue',desc:'The server has received the request headers and the client should proceed to send the request body.',cat:'1xx'},
  {code:101,name:'Switching Protocols',desc:'The requester has asked the server to switch protocols.',cat:'1xx'},
  {code:200,name:'OK',desc:'The request has succeeded.',cat:'2xx'},
  {code:201,name:'Created',desc:'The request has been fulfilled, resulting in the creation of a new resource.',cat:'2xx'},
  {code:204,name:'No Content',desc:'The server successfully processed the request and is not returning any content.',cat:'2xx'},
  {code:206,name:'Partial Content',desc:'The server is delivering only part of the resource due to a range header sent by the client.',cat:'2xx'},
  {code:301,name:'Moved Permanently',desc:'This and all future requests should be directed to the given URI.',cat:'3xx'},
  {code:302,name:'Found',desc:'The resource resides temporarily at a different URI.',cat:'3xx'},
  {code:304,name:'Not Modified',desc:'The resource has not been modified since the version specified by request headers.',cat:'3xx'},
  {code:307,name:'Temporary Redirect',desc:'The request should be repeated with another URI but future requests should use the original URI.',cat:'3xx'},
  {code:308,name:'Permanent Redirect',desc:'All future requests should be directed to the target resource.',cat:'3xx'},
  {code:400,name:'Bad Request',desc:'The server cannot process the request due to a client error.',cat:'4xx'},
  {code:401,name:'Unauthorized',desc:'Authentication is required and has failed or has not yet been provided.',cat:'4xx'},
  {code:403,name:'Forbidden',desc:'The server understood the request but refuses to authorize it.',cat:'4xx'},
  {code:404,name:'Not Found',desc:'The requested resource could not be found.',cat:'4xx'},
  {code:405,name:'Method Not Allowed',desc:'The request method is not supported for the requested resource.',cat:'4xx'},
  {code:408,name:'Request Timeout',desc:'The server timed out waiting for the request.',cat:'4xx'},
  {code:409,name:'Conflict',desc:'The request conflicts with the current state of the server.',cat:'4xx'},
  {code:410,name:'Gone',desc:'The resource has been permanently deleted and will not be available again.',cat:'4xx'},
  {code:422,name:'Unprocessable Entity',desc:'The request was well-formed but unable to be followed due to semantic errors.',cat:'4xx'},
  {code:429,name:'Too Many Requests',desc:'The user has sent too many requests in a given amount of time (rate limiting).',cat:'4xx'},
  {code:500,name:'Internal Server Error',desc:'A generic error message when an unexpected condition was encountered.',cat:'5xx'},
  {code:501,name:'Not Implemented',desc:'The server does not support the functionality required to fulfill the request.',cat:'5xx'},
  {code:502,name:'Bad Gateway',desc:'The server was acting as a gateway and received an invalid response from the upstream server.',cat:'5xx'},
  {code:503,name:'Service Unavailable',desc:'The server is not ready to handle the request, often used for maintenance.',cat:'5xx'},
  {code:504,name:'Gateway Timeout',desc:'The server was acting as a gateway and did not receive a timely response.',cat:'5xx'},
]
const CAT_COLORS:Record<string,string>={'1xx':'#6366f1','2xx':'#22c55e','3xx':'#f59e0b','4xx':'#ef4444','5xx':'#8b5cf6'}
export default function HttpStatusCodesPage() {
  const t = useTranslations('toolui')
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('all')
  const cats=['all','1xx','2xx','3xx','4xx','5xx']
  const filtered=CODES.filter(c=>(filter==='all'||c.cat===filter)&&(!search||String(c.code).includes(search)||c.name.toLowerCase().includes(search.toLowerCase())))
  const [sel,setSel]=useState<number|null>(null)
  const selItem=CODES.find(c=>c.code===sel)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('hsc_search')} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"/>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {cats.map(c=>(
              <button key={c} onClick={()=>setFilter(c)}
                className={`px-3 py-2 text-xs font-medium transition ${filter===c?'bg-gray-900 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>{c==='all'?t('hsc_all'):c}</button>
            ))}
          </div>
        </div>
        {selItem&&(
          <div className="rounded-xl p-4 border-2" style={{borderColor:CAT_COLORS[selItem.cat],background:CAT_COLORS[selItem.cat]+'15'}}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold" style={{color:CAT_COLORS[selItem.cat]}}>{selItem.code}</span>
              <span className="text-lg font-semibold text-gray-800">{selItem.name}</span>
              <button onClick={()=>setSel(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-sm text-gray-600">{selItem.desc}</p>
          </div>
        )}
        <div className="space-y-1.5">
          {filtered.map(c=>(
            <div key={c.code} onClick={()=>setSel(sel===c.code?null:c.code)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 cursor-pointer transition ${sel===c.code?'border-blue-500 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
              <span className="w-12 text-sm font-bold font-mono" style={{color:CAT_COLORS[c.cat]}}>{c.code}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">{c.name}</span>
              <span className="text-xs text-gray-400">{c.cat}</span>
            </div>
          ))}
          {filtered.length===0&&<p className="text-center text-gray-400 py-8">{t('hsc_nomatch')}</p>}
        </div>
      </div>
    </ToolLayout>
  )
}