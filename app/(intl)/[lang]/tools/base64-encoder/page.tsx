'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('base64-encoder')!

export default function Base64EncoderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode') // 디코더 페이지 통합 — 인코드/디코드 토글
  const [copied, setCopied] = useState(false)
  const trackedRef = useRef(false)

  const output = (() => {
    try {
      if (!input) return ''
      return mode === 'encode'
        ? btoa(unescape(encodeURIComponent(input)))
        : decodeURIComponent(escape(atob(input.trim())))
    } catch { return '' }
  })()

  // Track first successful encode per session
  useEffect(() => {
    if (output && !trackedRef.current) {
      trackedRef.current = true
      trackToolUsed('base64-encoder', 'encode')
    }
  }, [output])

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('base64-encoder')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={'flex-1 py-2 rounded-lg font-medium transition-colors ' + (mode === 'encode' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700')}>{t('ui_encode')}</button>
          <button onClick={() => setMode('decode')} className={'flex-1 py-2 rounded-lg font-medium transition-colors ' + (mode === 'decode' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700')}>{t('ui_decode')}</button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('b64_input')}</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); trackedRef.current = false }}
            placeholder={t('b64_ph')}
            className="w-full h-36 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium px-2">{t('b64_label')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="relative">
          <textarea
            value={output}
            readOnly
            placeholder={t('ui_output_ph')}
            className="w-full h-36 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-600 bg-gray-50 focus:outline-none"
          />
          {output && (
            <button
              onClick={copy}
              className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? t('ui_copied') : t('ui_copy')}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">{t('b64_note')}</p>
      </div>
    </ToolLayout>
  )
}
