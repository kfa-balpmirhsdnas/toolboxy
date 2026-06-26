'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('hiragana-katakana-converter')!

// Hiragana U+3041–3096 <-> Katakana U+30A1–30F6 (offset 0x60).
function toKatakana(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
}
function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

type Mode = 'to-kata' | 'to-hira'

export default function HiraganaKatakanaPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('to-kata')
  const [copied, setCopied] = useState(false)

  const output = !input ? '' : mode === 'to-kata' ? toKatakana(input) : toHiragana(input)

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('hiragana-katakana-converter')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {([['to-kata', 'ひらがな → カタカナ'], ['to-hira', 'カタカナ → ひらがな']] as [Mode, string][]).map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => { setMode(id); trackToolUsed('hiragana-katakana-converter', id) }}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  mode === id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'to-kata' ? 'ひらがな' : 'カタカナ'}
          className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        <div className="relative">
          <textarea
            value={output}
            readOnly
            placeholder="…"
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-base bg-gray-50 text-gray-800 focus:outline-none"
          />
          {output && (
            <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              {copied ? '✓ '+t('ui_copied') : t('ui_copy')}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">{t('hkc_note',{n:input.length})}</p>
      </div>

    </ToolLayout>
  )
}
