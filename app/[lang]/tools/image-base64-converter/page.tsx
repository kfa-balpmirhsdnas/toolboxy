'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('image-base64-converter')!

export default function ImageBase64ConverterPage({ params }: { params: { lang: string } }) {
  const [b64, setB64] = useState('')
  const [mime, setMime] = useState('image/png')
  const [preview, setPreview] = useState('')
  const [mode, setMode] = useState<'to-b64'|'from-b64'>('to-b64')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('image-base64-converter'); tracked.current = true }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    track()
    setMime(file.type)
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setB64(result)
      setPreview(result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function decodeB64() {
    track()
    const raw = b64.trim()
    if (!raw) return
    try {
      const dataUrl = raw.startsWith('data:') ? raw : 'data:' + mime + ';base64,' + raw.replace(/\s/g,'')
      setPreview(dataUrl)
      setError('')
    } catch {
      setError('Invalid Base64 image data')
      setPreview('')
    }
  }

  async function copy() {
    const toCopy = mode === 'to-b64' ? b64 : b64
    await navigator.clipboard.writeText(toCopy)
    trackToolCopy('image-base64-converter')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  function download() {
    if (!preview) return
    const a = document.createElement('a')
    a.href = preview
    a.download = 'decoded-image.' + (mime.split('/')[1] || 'png')
    a.click()
  }

  const cssSnippet = preview && mode === 'to-b64' ? 'background-image: url(' + b64.slice(0,50) + '...)' : ''

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['to-b64','Image \u2192 Base64'],['from-b64','Base64 \u2192 Image']] as const).map(([m,label]) => (
            <button key={m} onClick={()=>{ setMode(m); setB64(''); setPreview(''); setError('') }}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        {mode === 'to-b64' ? (
          <label className={'flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ' + (b64?'border-brand-300 bg-brand-50':'border-gray-300 bg-gray-50 hover:border-brand-300')}>
            <span className="text-gray-500 text-sm mb-2">{b64 ? '\u2713 Image loaded — click to change' : 'Click or drag an image here'}</span>
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              {['image/png','image/jpeg','image/gif','image/webp','image/svg+xml'].map(m=>(
                <button key={m} onClick={()=>setMime(m)}
                  className={'px-2 py-1 rounded-lg text-xs transition-colors ' + (mime===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {m.split('/')[1]}
                </button>
              ))}
            </div>
            <textarea value={b64} onChange={e=>setB64(e.target.value)} placeholder="Paste Base64 string here (with or without data: prefix)..." rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
            <button onClick={decodeB64} className="px-4 py-2 bg-brand-600 text-white text-sm rounded-xl hover:bg-brand-700 transition-colors">Decode</button>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {preview && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center min-h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-48 max-w-full object-contain rounded-xl" />
            </div>
            {mode === 'to-b64' && b64 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{b64.length.toLocaleString()} characters</span>
                  <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?'\u2713 Copied':'Copy Base64'}</button>
                </div>
                <div className="p-3 bg-gray-900 text-green-400 text-xs rounded-xl font-mono break-all max-h-24 overflow-y-auto">{b64.slice(0,300)}{b64.length>300?'...':''}</div>
              </div>
            )}
            {mode === 'from-b64' && (
              <button onClick={download} className="px-4 py-2 bg-brand-600 text-white text-sm rounded-xl hover:bg-brand-700 transition-colors">Download Image</button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
