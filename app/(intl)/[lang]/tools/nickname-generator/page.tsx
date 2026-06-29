'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('nickname-generator')!
const ADJ = ['cool', 'dark', 'epic', 'lucky', 'swift', 'mighty', 'silent', 'wild', 'neon', 'royal', 'crazy', 'happy', 'golden', 'mystic', 'cyber', 'retro', 'urban', 'frozen', 'solar', 'lunar', 'rapid', 'brave', 'shadow', 'crystal']
const NOUN = ['tiger', 'wolf', 'phoenix', 'ninja', 'panda', 'dragon', 'falcon', 'rider', 'ghost', 'star', 'wave', 'pixel', 'storm', 'fox', 'lion', 'bear', 'hawk', 'comet', 'blaze', 'raven', 'otter', 'koala', 'maple', 'echo']
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function generate(seed: string): string[] {
  const base = seed.trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '')
  const seps = ['', '_', '.']
  const suffix = () => pick(['', '', String(Math.floor(Math.random() * 90) + 10), String(Math.floor(Math.random() * 900) + 100), '_' + (Math.floor(Math.random() * 99) + 1), 'x', 'official', 'hq'])
  const out = new Set<string>()
  let tries = 0
  while (out.size < 18 && tries < 300) {
    tries++
    const sep = pick(seps)
    let parts: string[]
    if (base && Math.random() < 0.6) parts = Math.random() < 0.5 ? [base, pick(NOUN)] : [pick(ADJ), base]
    else parts = [pick(ADJ), pick(NOUN)]
    let name = (Math.random() < 0.4 ? parts.map(cap) : parts).join(sep) + suffix()
    if (name.length >= 3 && name.length <= 22) out.add(name)
  }
  return [...out]
}

export default function NicknameGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed, setSeed] = useState('')
  const [names, setNames] = useState<string[]>([])
  const [copied, setCopied] = useState('')

  const run = useCallback(() => setNames(generate(seed)), [seed])
  useEffect(() => { setNames(generate('')) }, [])

  function copy(n: string) { navigator.clipboard?.writeText(n); setCopied(n); setTimeout(() => setCopied(''), 1200) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ng_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ng_subtitle')}</p>
        </div>

        <div className="flex gap-2">
          <input value={seed} onChange={(e) => setSeed(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} type="search"
            autoComplete="off" data-1p-ignore placeholder={t('ng_ph')}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button onClick={run} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 inline-flex items-center justify-center gap-1.5"><ToolIcon name="refresh" className="w-4 h-4" />{t('ng_gen')}</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {names.map((n) => (
            <button key={n} onClick={() => copy(n)} title={t('ng_copy')}
              className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm hover:border-brand-400 hover:bg-brand-50">
              <span className="truncate font-medium text-gray-800">{n}</span>
              <span className="shrink-0 text-xs text-gray-400">{copied === n ? '✓' : '📋'}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{t('ng_note')}</p>
      </div>
    </ToolLayout>
  )
}
