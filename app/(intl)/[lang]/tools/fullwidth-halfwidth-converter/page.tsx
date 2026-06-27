'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('fullwidth-halfwidth-converter')!

// Full-width (全角) ASCII U+FF01–FF5E <-> half-width U+0021–007E (offset 0xFEE0).
function toHalfwidth(s: string): string {
  return s
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/　/g, ' ')
}
function toFullwidth(s: string): string {
  return s
    .replace(/ /g, '　')
    .replace(/[!-~]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xFEE0))
}

type Mode = 'to-half' | 'to-full'

export default function FullwidthHalfwidthPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('to-half')
  const [copied, setCopied] = useState(false)

  const output = !input ? '' : mode === 'to-half' ? toHalfwidth(input) : toFullwidth(input)

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('fullwidth-halfwidth-converter')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {([['to-half', 'fwh_to_half'], ['to-full', 'fwh_to_full']] as [Mode, string][]).map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => { setMode(id); trackToolUsed('fullwidth-halfwidth-converter', id) }}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  mode === id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                }`}
              >
                {t(label)}
              </button>
            ),
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'to-half' ? 'ＡＢＣ１２３　！？' : 'ABC123 !?'}
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
              {copied ? t('ui_copied') : t('ui_copy')}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {input.length} {t('ui_chars')} · {t('fwh_note')}
        </p>
      </div>

    </ToolLayout>
  )
}
