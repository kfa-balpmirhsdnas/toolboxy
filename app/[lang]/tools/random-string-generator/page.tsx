'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('random-string-generator')!

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
}

function randomString(len: number, charset: string, count: number): string[] {
  if (!charset) return []
  const buf = new Uint32Array(len)
  const out: string[] = []
  for (let n = 0; n < count; n++) {
    crypto.getRandomValues(buf)
    let s = ''
    for (let i = 0; i < len; i++) s += charset[buf[i] % charset.length]
    out.push(s)
  }
  return out
}

export default function RandomStringPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [len, setLen] = useState(16)
  const [count, setCount] = useState(1)
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: false })
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const charset = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => opts[k]).map((k) => SETS[k]).join('')

  function generate() {
    setResults(randomString(len, charset, Math.min(count, 100)))
    trackToolUsed('random-string-generator', 'generate')
  }

  async function copy() {
    await navigator.clipboard.writeText(results.join('\n'))
    setCopied(true)
    trackToolCopy('random-string-generator')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rsg_length')}: {len}</label>
            <input type="range" min={1} max={128} value={len} onChange={(e) => setLen(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rsg_howmany')}</label>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(+e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
            <label key={k} className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
              <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} /> {t('rsg_'+k)}
            </label>
          ))}
        </div>
        <button onClick={generate} disabled={!charset}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">{t('ui_generate')}</button>

        {results.length > 0 && (
          <div className="relative">
            <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 whitespace-pre-wrap break-all min-h-[3rem]">{results.join('\n')}</pre>
            <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ '+t('ui_copied') : t('ui_copy')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('rsg_note')}</p>
      </div>

    </ToolLayout>
  )
}
