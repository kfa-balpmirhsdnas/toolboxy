'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('hashtag-generator')!

export default function HashtagGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const tags = Array.from(new Set(
    text.split(/[\s,#\n]+/).map((w) => w.trim().replace(/[^\p{L}\p{N}_]/gu, '')).filter(Boolean).map((w) => '#' + w)
  ))
  const joined = tags.join(' ')
  const over = tags.length > 30 // Instagram limit

  function copy() { navigator.clipboard?.writeText(joined); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('hg_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('hg_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('hg_input')}
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} autoFocus placeholder={t('hg_placeholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y" />
        </label>

        {tags.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tg) => <span key={tg} className="px-2.5 py-1 text-sm rounded-full bg-brand-50 text-brand-700">{tg}</span>)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={over ? 'text-rose-600' : 'text-gray-500'}>{t('hg_count', { n: tags.length })}{over ? ` · ${t('hg_over')}` : ''}</span>
              <button onClick={copy} className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium">{copied ? `✓ ${t('hg_copied')}` : t('hg_copy')}</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">{t('hg_note')}</p>
      </div>
    </ToolLayout>
  )
}
