'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'
import type { Lang } from '@/lib/word-translate'

/**
 * Shared instant single-word translator for any direction (ko/ja/en).
 * Lazily loads the derived dictionary on first interaction.
 */
export default function WordTranslator({ slug, from, to, lang }: { slug: string; from: Lang; to: Lang; lang: string }) {
  const t = useTranslations('toolui')
  const tool = getToolBySlug(slug)!
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [dict, setDict] = useState<Record<string, string> | null>(null)

  const loadDict = useCallback(() => {
    if (!dict) import('@/lib/word-translate').then((m) => setDict(m.buildDict(from, to)))
  }, [dict, from, to])

  const key = from === 'en' ? input.trim().toLowerCase() : input.trim().replace(/\s+/g, '')
  const result = dict && key ? (dict[key] ?? '') : ''

  function onChange(v: string) {
    setInput(v); setCopied(false)
    loadDict()
    const k = from === 'en' ? v.trim().toLowerCase() : v.trim().replace(/\s+/g, '')
    if (k && dict?.[k]) trackToolUsed(slug)
  }

  async function copy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  function speak() {
    if (!result || typeof window === 'undefined' || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(result.replace(/・/g, '、'))
    u.lang = to === 'ko' ? 'ko-KR' : to === 'ja' ? 'ja-JP' : 'en-US'
    u.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4">
        <input value={input} onChange={(e) => onChange(e.target.value)} onFocus={loadDict} autoFocus
          placeholder={t('wt_ph')}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="min-h-[5rem] rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-center text-center">
          {!key ? (
            <p className="text-sm text-gray-400">{t('wt_hint')}</p>
          ) : !dict ? (
            <p className="text-sm text-gray-400">…</p>
          ) : result ? (
            <div>
              <p className="text-3xl font-bold text-gray-900">{result}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button onClick={speak} aria-label="Listen" title="🔊"
                  className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">🔊</button>
                <button onClick={copy} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">{copied ? t('qs_copied') : t('qs_copy')}</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('wt_notfound')}</p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">{t('wt_note')}</p>
      </div>
    </ToolLayout>
  )
}
