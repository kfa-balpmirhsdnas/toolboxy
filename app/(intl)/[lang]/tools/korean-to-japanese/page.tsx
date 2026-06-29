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
  // Result frozen on Enter: stays shown after the input clears, until the user types.
  const [held, setHeld] = useState<string | null>(null)
  const [dict, setDict] = useState<Record<string, string> | null>(null)
  const [furi, setFuri] = useState<Record<string, string> | null>(null)

  // Lazily load the (large) dictionary + furigana on first interaction.
  const loadDict = useCallback(() => {
    if (!dict) import('@/lib/kr-ja-dict').then((m) => setDict(m.KR_JA))
    if (!furi) import('@/lib/furigana').then((m) => setFuri(m.FURIGANA))
  }, [dict, furi])

  const key = input.trim().replace(/\s+/g, '')
  const result = dict && key ? (dict[key] ?? '') : ''
  const shown = held !== null ? held : result // value currently displayed/spoken/copied

  function onChange(v: string) {
    setInput(v); setCopied(false); setHeld(null) // typing clears the held result
    loadDict()
    if (v.trim() && dict?.[v.trim().replace(/\s+/g, '')]) trackToolUsed('korean-to-japanese')
  }

  async function copy() {
    if (!shown) return
    await navigator.clipboard.writeText(shown)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  function speak() {
    if (!shown || typeof window === 'undefined' || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(shown.replace(/・/g, '、'))
    u.lang = 'ja-JP'
    u.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  const resultView = (value: string) => (
    <div>
      <p className="text-3xl font-bold text-gray-900 leading-loose"><RubyText text={value} furi={furi} /></p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button onClick={speak} aria-label="Listen" title="🔊"
          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">🔊</button>
        <button onClick={copy} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">{copied ? t('qs_copied') : t('qs_copy')}</button>
      </div>
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={input} onChange={(e) => onChange(e.target.value)} autoFocus
          type="search" name="tbx-word" inputMode="text" enterKeyHint="search"
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          data-1p-ignore data-lpignore="true" data-bwignore="true" data-form-type="other"
          onFocus={loadDict}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setHeld(result || null); setInput(''); setCopied(false) } }}
          onPointerDown={(e) => {
            const el = e.currentTarget
            setInput(''); setCopied(false); loadDict()
            if (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches)
              setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
          }}
          placeholder={t('kj_ph')}
          className="w-full scroll-mt-16 rounded-xl border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="min-h-[5rem] rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center justify-center text-center">
          {held !== null ? (
            resultView(held)
          ) : !key ? (
            <p className="text-sm text-gray-400">{t('kj_hint')}</p>
          ) : !dict ? (
            <p className="text-sm text-gray-400">…</p>
          ) : result ? (
            resultView(result)
          ) : (
            <p className="text-sm text-gray-500">{t('kj_notfound')}</p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">{t('kj_note')}</p>
      </div>
    </ToolLayout>
  )
}
