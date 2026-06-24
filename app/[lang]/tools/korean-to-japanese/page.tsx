'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import RubyText from '@/components/tools/RubyText'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('korean-to-japanese')!

export default function KoreanToJapanesePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [dict, setDict] = useState<Record<string, string> | null>(null)
  const [furi, setFuri] = useState<Record<string, string> | null>(null)

  // Lazily load the (large) dictionary + furigana on first interaction.
  const loadDict = useCallback(() => {
    if (!dict) import('@/lib/kr-ja-dict').then((m) => setDict(m.KR_JA))
    if (!furi) import('@/lib/furigana').then((m) => setFuri(m.FURIGANA))
  }, [dict, furi])

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

  function speak() {
    if (!result || typeof window === 'undefined' || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(result.replace(/・/g, '、'))
    u.lang = 'ja-JP'
    u.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={input} onChange={(e) => onChange(e.target.value)} autoFocus
          onFocus={loadDict}
          onPointerDown={(e) => {
            const el = e.currentTarget
            setInput(''); setCopied(false); loadDict()
            if (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches)
              setTimeout(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' }), 300)
          }}
          placeholder={t('kj_ph')}
          className="w-full scroll-mt-20 rounded-xl border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="min-h-[5rem] rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-center text-center">
          {!key ? (
            <p className="text-sm text-gray-400">{t('kj_hint')}</p>
          ) : !dict ? (
            <p className="text-sm text-gray-400">…</p>
          ) : result ? (
            <div>
              <p className="text-3xl font-bold text-gray-900 leading-loose"><RubyText text={result} furi={furi} /></p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button onClick={speak} aria-label="Listen" title="🔊"
                  className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">🔊</button>
                <button onClick={copy} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">{copied ? t('qs_copied') : t('qs_copy')}</button>
              </div>
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
