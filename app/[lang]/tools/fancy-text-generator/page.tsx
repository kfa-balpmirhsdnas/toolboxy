'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('fancy-text-generator')!

function offset(ch: string, up: number, lo: number, dg: number): string {
  const c = ch.charCodeAt(0)
  if (c >= 65 && c <= 90) return String.fromCodePoint(up + (c - 65))
  if (c >= 97 && c <= 122) return String.fromCodePoint(lo + (c - 97))
  if (dg && c >= 48 && c <= 57) return String.fromCodePoint(dg + (c - 48))
  return ch
}

const STYLES: { k: string; fn: (s: string) => string }[] = [
  { k: 'bold', fn: (s) => [...s].map((c) => offset(c, 0x1D400, 0x1D41A, 0x1D7CE)).join('') },
  { k: 'bolditalic', fn: (s) => [...s].map((c) => offset(c, 0x1D468, 0x1D482, 0x1D7CE)).join('') },
  { k: 'script', fn: (s) => [...s].map((c) => offset(c, 0x1D4D0, 0x1D4EA, 0)).join('') },
  { k: 'mono', fn: (s) => [...s].map((c) => offset(c, 0x1D670, 0x1D68A, 0x1D7F6)).join('') },
  { k: 'fullwidth', fn: (s) => [...s].map((c) => offset(c, 0xFF21, 0xFF41, 0xFF10)).join('') },
  { k: 'circled', fn: (s) => [...s].map((c) => { const n = c.charCodeAt(0); if (n >= 49 && n <= 57) return String.fromCodePoint(0x2460 + n - 49); return offset(c, 0x24B6, 0x24D0, 0) }).join('') },
  { k: 'strike', fn: (s) => [...s].map((c) => c + '̶').join('') },
  { k: 'underline', fn: (s) => [...s].map((c) => c + '̲').join('') },
]

export default function FancyTextPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('Toolboxy')
  const [copiedIdx, setCopiedIdx] = useState(-1)

  async function copy(text: string, i: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(i)
    trackToolCopy('fancy-text-generator')
    setTimeout(() => setCopiedIdx(-1), 1200)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('ui_text_ph')}
          className="w-full p-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="space-y-2">
          {STYLES.map((st, i) => {
            const out = input ? st.fn(input) : ''
            return (
              <button key={st.k} onClick={() => out && copy(out, i)}
                className="w-full flex items-center gap-3 text-left bg-gray-50 hover:bg-brand-50 border border-gray-200 rounded-xl px-4 py-3 transition-colors">
                <span className="text-xs text-gray-400 w-24 shrink-0">{t('fty_'+st.k)}</span>
                <span className="flex-1 text-lg text-gray-900 truncate">{out}</span>
                <span className="text-xs text-brand-600 shrink-0">{copiedIdx === i ? t('ui_copied') : t('ui_copy')}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400">{t('fty_note')}</p>
      </div>

    </ToolLayout>
  )
}
