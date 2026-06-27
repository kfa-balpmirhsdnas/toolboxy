'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('base64-decoder')!

export default function Base64DecoderPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const trackedRef = useRef(false)

  const output = (() => {
    if (!input.trim()) return ''
    try { return decodeURIComponent(escape(atob(input.trim()))) } catch { return t('b64d_invalid') }
  })()

  useEffect(() => {
    if (output && !output.startsWith('⚠') && !trackedRef.current) {
      trackedRef.current = true
      trackToolUsed('base64-decoder', 'decode')
    }
  }, [output])

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('base64-decoder')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('b64d_input')}</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); trackedRef.current = false }}
            placeholder={t('b64d_ph')}
            className="w-full h-36 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium px-2">{t('b64d_label')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="relative">
          <textarea
            value={output}
            readOnly
            placeholder={t('ui_output_ph')}
            className={`w-full h-36 p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono bg-gray-50 focus:outline-none ${output.startsWith('⚠') ? 'text-red-500' : 'text-gray-600'}`}
          />
          {output && !output.startsWith('⚠') && (
            <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              {copied ? t('ui_copied') : t('ui_copy')}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400">{t('b64_note')}</p>
      </div>
    </ToolLayout>
  )
}
