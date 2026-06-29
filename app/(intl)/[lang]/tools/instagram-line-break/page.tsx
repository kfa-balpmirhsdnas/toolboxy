'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('instagram-line-break')!
const BLANK = '⠀' // Braille pattern blank — survives Instagram's blank-line stripping

export default function InstagramLineBreakPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  // replace each empty line with an invisible braille-blank char so IG keeps the gap
  const output = text.split('\n').map((line) => (line.trim() === '' ? BLANK : line)).join('\n')

  function copy() {
    navigator.clipboard?.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ilb_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ilb_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('ilb_input')}
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} autoFocus placeholder={t('ilb_placeholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y" />
        </label>

        {text && (
          <button onClick={copy} className="w-full px-5 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">
            {copied ? <span className="inline-flex items-center gap-1"><ToolIcon name="check" className="w-3.5 h-3.5" />{t('ilb_copied')}</span> : t('ilb_copy')}
          </button>
        )}
        <p className="text-xs text-gray-400">{t('ilb_note')}</p>
      </div>
    </ToolLayout>
  )
}
