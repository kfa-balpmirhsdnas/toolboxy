'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
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

const STYLES: { name: string; fn: (s: string) => string }[] = [
  { name: 'Bold', fn: (s) => [...s].map((c) => offset(c, 0x1D400, 0x1D41A, 0x1D7CE)).join('') },
  { name: 'Bold Italic', fn: (s) => [...s].map((c) => offset(c, 0x1D468, 0x1D482, 0x1D7CE)).join('') },
  { name: 'Script', fn: (s) => [...s].map((c) => offset(c, 0x1D4D0, 0x1D4EA, 0)).join('') },
  { name: 'Monospace', fn: (s) => [...s].map((c) => offset(c, 0x1D670, 0x1D68A, 0x1D7F6)).join('') },
  { name: 'Fullwidth', fn: (s) => [...s].map((c) => offset(c, 0xFF21, 0xFF41, 0xFF10)).join('') },
  { name: 'Circled', fn: (s) => [...s].map((c) => { const n = c.charCodeAt(0); if (n >= 49 && n <= 57) return String.fromCodePoint(0x2460 + n - 49); return offset(c, 0x24B6, 0x24D0, 0) }).join('') },
  { name: 'Strikethrough', fn: (s) => [...s].map((c) => c + '̶').join('') },
  { name: 'Underline', fn: (s) => [...s].map((c) => c + '̲').join('') },
]

export default function FancyTextPage({ params }: { params: { lang: string } }) {
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
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your text…"
          className="w-full p-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="space-y-2">
          {STYLES.map((st, i) => {
            const out = input ? st.fn(input) : ''
            return (
              <button key={st.name} onClick={() => out && copy(out, i)}
                className="w-full flex items-center gap-3 text-left bg-gray-50 hover:bg-brand-50 border border-gray-200 rounded-xl px-4 py-3 transition-colors">
                <span className="text-xs text-gray-400 w-24 shrink-0">{st.name}</span>
                <span className="flex-1 text-lg text-gray-900 truncate">{out}</span>
                <span className="text-xs text-brand-600 shrink-0">{copiedIdx === i ? '✓ Copied' : 'Copy'}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400">Unicode &ldquo;fonts&rdquo; you can paste into Instagram, TikTok, bios and more.</p>
      </div>

      <ToolFaq slug="fancy-text-generator" />
    </ToolLayout>
  )
}
