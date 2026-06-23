'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('hangul-romaja-converter')!

// Revised Romanization of Korean (per-syllable; no inter-syllable assimilation).
const CHO = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
const JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
const JONG = ['','k','k','k','n','n','n','t','l','k','m','p','t','t','p','h','m','p','p','t','t','ng','t','t','k','t','p','t']

function hangulToRomaja(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.charCodeAt(0)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const idx = code - 0xac00
      out += CHO[Math.floor(idx / 588)] + JUNG[Math.floor((idx % 588) / 28)] + JONG[idx % 28]
    } else {
      out += ch
    }
  }
  return out
}

export default function HangulRomajaPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const output = input ? hangulToRomaja(input) : ''

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('hangul-romaja-converter')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); trackToolUsed('hangul-romaja-converter', 'convert') }}
          placeholder="안녕하세요, 서울"
          className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        <div className="relative">
          <textarea
            value={output}
            readOnly
            placeholder="annyeonghaseyo, seoul"
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-base bg-gray-50 text-gray-800 focus:outline-none"
          />
          {output && (
            <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {input.length} chars · Revised Romanization. Per-syllable conversion — pronunciation assimilation between syllables is not applied.
        </p>
      </div>

      <ToolFaq slug="hangul-romaja-converter" />
    </ToolLayout>
  )
}
