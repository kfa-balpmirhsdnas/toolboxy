'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('blood-type-inheritance')!
const TYPES = ['A', 'B', 'O', 'AB']
const GENO: Record<string, string[][]> = { A: [['A', 'A'], ['A', 'O']], B: [['B', 'B'], ['B', 'O']], O: [['O', 'O']], AB: [['A', 'B']] }

function pheno(a: string, b: string): string {
  const s = [a, b].sort().join('')
  if (s === 'AA' || s === 'AO') return 'A'
  if (s === 'BB' || s === 'BO') return 'B'
  if (s === 'AB') return 'AB'
  return 'O'
}
function possibleChildren(p1: string, p2: string): Set<string> {
  const set = new Set<string>()
  for (const g1 of GENO[p1]) for (const g2 of GENO[p2]) for (const a of g1) for (const b of g2) set.add(pheno(a, b))
  return set
}

export default function BloodType({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [p1, setP1] = useState('A')
  const [p2, setP2] = useState('B')
  const possible = possibleChildren(p1, p2)
  const suffix = lang === 'ko' ? '형' : lang === 'ja' ? '型' : ''

  const parentSel = (val: string, set: (v: string) => void, label: string) => (
    <label className="flex flex-col gap-1.5 text-sm text-gray-600">{label}
      <select value={val} onChange={(e) => set(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-400">
        {TYPES.map((ty) => <option key={ty} value={ty}>{ty}{suffix}</option>)}
      </select>
    </label>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('bt_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('bt_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {parentSel(p1, setP1, t('bt_parent1'))}
          {parentSel(p2, setP2, t('bt_parent2'))}
        </div>

        <div className="rounded-2xl border-2 border-brand-100 bg-brand-50 p-5">
          <div className="text-xs text-brand-500 mb-3 text-center">{t('bt_children')}</div>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map((ty) => {
              const yes = possible.has(ty)
              return (
                <div key={ty} className={`rounded-xl py-3 text-center text-lg font-bold ${yes ? 'bg-green-500 text-white' : 'bg-white text-gray-300 line-through'}`}>{ty}{suffix}</div>
              )
            })}
          </div>
          <div className="mt-3 text-center text-sm text-gray-700">
            {t('bt_possible')}: <b>{TYPES.filter((ty) => possible.has(ty)).map((ty) => ty + suffix).join(', ')}</b>
          </div>
        </div>

        <p className="text-xs text-gray-400">{t('bt_note')}</p>
      </div>
    </ToolLayout>
  )
}
