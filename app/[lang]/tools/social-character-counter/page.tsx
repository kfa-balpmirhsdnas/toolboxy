'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('social-character-counter')!
const PLATFORMS: [string, number][] = [
  ['X / Twitter', 280], ['Instagram', 2200], ['Instagram bio', 150], ['Threads', 500],
  ['Facebook', 63206], ['YouTube title', 100], ['YouTube desc', 5000], ['TikTok', 2200], ['LinkedIn', 3000],
]

export default function SocialCharCounterPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [text, setText] = useState('')
  const chars = [...text].length
  const noSpace = [...text.replace(/\s/g, '')].length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split(/\n/).length : 0
  const bytes = new TextEncoder().encode(text).length

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('scc_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('scc_subtitle')}</p>
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} autoFocus placeholder={t('scc_placeholder')}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {([['scc_chars', chars], ['scc_nospace', noSpace], ['scc_words', words], ['scc_bytes', bytes]] as const).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-gray-100 py-2"><div className="text-xl font-bold text-gray-800 tabular-nums">{v.toLocaleString()}</div><div className="text-xs text-gray-400">{t(k)}</div></div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {PLATFORMS.map(([name, limit]) => {
            const left = limit - chars, over = left < 0
            return (
              <div key={name} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-gray-600">{name} <span className="text-gray-400">{limit.toLocaleString()}</span></span>
                <span className={`tabular-nums font-medium ${over ? 'text-rose-600' : left < limit * 0.1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {over ? t('scc_over', { n: (-left).toLocaleString() }) : t('scc_left', { n: left.toLocaleString() })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}
