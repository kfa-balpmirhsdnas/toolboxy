'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('hex-dump-viewer')!

function toHexDump(bytes: Uint8Array, width = 16): string {
  const lines: string[] = []
  for (let i = 0; i < bytes.length; i += width) {
    const chunk = bytes.slice(i, i+width)
    const offset = i.toString(16).padStart(8,'0').toUpperCase()
    const hexParts: string[] = []
    const asciiParts: string[] = []
    for (let j = 0; j < width; j++) {
      if (j < chunk.length) {
        hexParts.push(chunk[j].toString(16).padStart(2,'0').toUpperCase())
        asciiParts.push(chunk[j] >= 32 && chunk[j] < 127 ? String.fromCharCode(chunk[j]) : '.')
      } else {
        hexParts.push('  ')
        asciiParts.push(' ')
      }
      if (j === 7) hexParts.push('')
    }
    lines.push(offset + '  ' + hexParts.join(' ') + '  |' + asciiParts.join('') + '|')
  }
  return lines.join('\n')
}

export default function HexDumpViewerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('Hello, World! This is a hex dump example.')
  const [mode, setMode] = useState<'text'|'hex'>('text')
  const [width, setWidth] = useState(16)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('hex-dump-viewer'); tracked.current = true } }

  let bytes: Uint8Array | null = null
  let error = ''
  
  if (mode === 'text') {
    bytes = new TextEncoder().encode(input)
  } else {
    const hex = input.replace(/\s+/g,'')
    if (/^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0) {
      bytes = new Uint8Array(hex.length/2)
      for (let i=0;i<hex.length;i+=2) bytes[i/2]=parseInt(hex.slice(i,i+2),16)
    } else {
      error = t('hd_invalid')
    }
  }

  const dump = bytes ? toHexDump(bytes, width) : ''

  async function copy() {
    await navigator.clipboard.writeText(dump)
    trackToolCopy('hex-dump-viewer')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          {(['text','hex'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode===m?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t('hd_as_'+m)}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-gray-500">{t('hd_width')}</label>
            {[8,16,32].map(w=>(
              <button key={w} onClick={()=>setWidth(w)}
                className={'px-2 py-1 rounded-lg text-xs transition-colors ' + (width===w?'bg-gray-700 text-white':'bg-gray-100 text-gray-600')}>
                {w}
              </button>
            ))}
          </div>
        </div>
        <textarea value={input} onChange={e=>{setInput(e.target.value);track()}} rows={3} placeholder={mode==='text'?t('hd_ph_text'):t('hd_ph_hex')}
          className={'w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (error?'border-red-300':'border-gray-200')} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {bytes && <p className="text-xs text-gray-500">{bytes.length} {t('jf_bytes')}</p>}
        {dump && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">{t('hd_dump')}</label>
              <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?t('ui_copied'):t('ui_copy')}</button>
            </div>
            <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto max-h-80">{dump}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
