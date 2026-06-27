'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('base64-url-encoder')!

type Mode = 'encode'|'decode'
type Variant = 'standard'|'url-safe'

function encodeB64(str: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''; for (const b of bytes) bin += String.fromCharCode(b)
  let b64 = btoa(bin)
  if (urlSafe) b64 = b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
  return b64
}
function decodeB64(b64: string): string {
  let s = b64.replace(/-/g,'+').replace(/_/g,'/')
  while (s.length%4) s+='='
  const bin = atob(s)
  const arr = new Uint8Array(bin.length)
  for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i)
  return new TextDecoder('utf-8').decode(arr)
}

function encodeUrl(str: string): string { return encodeURIComponent(str) }
function decodeUrl(str: string): string { try { return decodeURIComponent(str) } catch { return 'Invalid encoding' } }

const PRESETS = [
  { label:'Hello World', value:'Hello, World! 안녕 🌍' },
  { label:'JSON', value:'{"name":"Alice","age":30}' },
  { label:'URL', value:'https://example.com/path?q=hello world&lang=한국어' },
]

export default function Base64UrlEncoderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('Hello, World!')
  const [mode, setMode] = useState<Mode>('encode')
  const [type, setType] = useState<'base64'|'url'>('base64')
  const [variant, setVariant] = useState<Variant>('standard')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('base64-url-encoder'); tracked.current = true } }

  let output = ''
  let error = ''
  try {
    if (type==='base64') {
      output = mode==='encode' ? encodeB64(input,variant==='url-safe') : decodeB64(input)
    } else {
      output = mode==='encode' ? encodeUrl(input) : decodeUrl(input)
    }
  } catch(e:unknown) { error = e instanceof Error ? e.message : 'Error' }

  async function copy() {
    await navigator.clipboard.writeText(output)
    trackToolCopy('base64-url-encoder')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {(['base64','url'] as const).map(ty=>(
              <button key={ty} onClick={()=>{setType(ty);track()}}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium uppercase transition-colors ' + (type===ty?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {ty==='base64'?'Base64':t('b64u_url')}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['encode','decode'] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);track()}}
                className={'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ' + (mode===m?'bg-gray-700 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {t(m==='encode'?'ui_encode':'ui_decode')}
              </button>
            ))}
          </div>
          {type==='base64' && (
            <div className="flex gap-1">
              {(['standard','url-safe'] as Variant[]).map(v=>(
                <button key={v} onClick={()=>{setVariant(v);track()}}
                  className={'px-2.5 py-1.5 rounded-lg text-xs transition-colors ' + (variant===v?'bg-gray-700 text-white':'bg-gray-100 text-gray-600')}>
                  {t(v==='standard'?'b64u_standard':'b64u_urlsafe')}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setInput(p.value);track()}}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={3} placeholder={t('ui_text_ph')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">{t('b64u_out',{n:output.length})}</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 '+t('ui_copied'):t('ui_copy')}</button>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono break-all">{output}</div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
