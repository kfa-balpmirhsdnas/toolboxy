'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('korean-to-japanese')!

export default function KoreanToJapanesePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [dict, setDict] = useState<Record<string, string> | null>(null)

  // Lazily load the (large) dictionary on first interaction, not on page load.
  const loadDict = useCallback(() => {
    if (!dict) import('@/lib/kr-ja-dict').then((m) => setDict(m.KR_JA))
  }, [dict])

  const key = input.trim().replace(/\s+/g, '')
  const result = dict && key ? (dict[key] ?? '') : ''

  function onChange(v: string) {
    setInput(v); setCopied(false)
    loadDict()
    if (v.trim() && dict?.[v.trim().replace(/\s+/g, '')]) trackToolUsed('korean-to-japanese')
  }

  async function copy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={input} onChange={(e) => onChange(e.target.value)} onFocus={loadDict} autoFocus
          placeholder={t('kj_ph')}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="min-h-[5rem] rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-center text-center">
          {!key ? (
            <p className="text-sm text-gray-400">{t('kj_hint')}</p>
          ) : !dict ? (
            <p className="text-sm text-gray-400">…</p>
          ) : result ? (
            <div>
              <p className="text-3xl font-bold text-gray-900">{result}</p>
              <button onClick={copy} className="mt-3 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">{copied ? t('qs_copied') : t('qs_copy')}</button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('kj_notfound')}</p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">{t('kj_note')}</p>
      </div>
    </ToolLayout>
  )
}
