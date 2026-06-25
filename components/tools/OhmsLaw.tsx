'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('ohms-law-calculator')!

type F = { V: string; I: string; R: string; P: string }
const UNITS: Record<keyof F, string> = { V: 'V', I: 'A', R: 'Ω', P: 'W' }

function solve(f: F): { V: number; I: number; R: number; P: number } | null {
  const v = parseFloat(f.V), i = parseFloat(f.I), r = parseFloat(f.R), p = parseFloat(f.P)
  const known: Record<string, number> = {}
  if (!isNaN(v)) known.V = v
  if (!isNaN(i)) known.I = i
  if (!isNaN(r)) known.R = r
  if (!isNaN(p)) known.P = p
  const ks = Object.keys(known)
  if (ks.length < 2) return null
  let { V, I, R, P } = known as { V?: number; I?: number; R?: number; P?: number }
  // derive V,I,R,P from any two
  if (V != null && I != null) { R = V / I; P = V * I }
  else if (V != null && R != null) { I = V / R; P = (V * V) / R }
  else if (V != null && P != null) { I = P / V; R = (V * V) / P }
  else if (I != null && R != null) { V = I * R; P = I * I * R }
  else if (I != null && P != null) { V = P / I; R = P / (I * I) }
  else if (R != null && P != null) { V = Math.sqrt(P * R); I = Math.sqrt(P / R) }
  if (V == null || I == null || R == null || P == null) return null
  return { V, I, R, P }
}

const fnum = (n: number) => (Number.isFinite(n) ? +n.toPrecision(5) : '—')

export default function OhmsLaw({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [f, setF] = useState<F>({ V: '12', I: '', R: '4', P: '' })
  const res = solve(f)
  const filled = (['V', 'I', 'R', 'P'] as (keyof F)[]).filter((k) => f[k].trim() !== '' && !isNaN(parseFloat(f[k])))

  const field = (k: keyof F, label: string) => (
    <label className="flex flex-col gap-1 text-sm text-gray-600">{label} ({UNITS[k]})
      <input value={f[k]} onChange={(e) => setF((p) => ({ ...p, [k]: e.target.value }))} type="search" inputMode="decimal" name={`tbx-${String(k)}`}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} data-1p-ignore data-lpignore="true" data-bwignore="true" data-form-type="other"
        className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </label>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ol_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ol_subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field('V', t('ol_voltage'))}
          {field('I', t('ol_current'))}
          {field('R', t('ol_resistance'))}
          {field('P', t('ol_power'))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{t('ol_hint')}</p>
          <button onClick={() => setF({ V: '', I: '', R: '', P: '' })} className="text-xs border border-gray-200 rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-50">{t('ol_clear')}</button>
        </div>

        {res ? (
          <div className="grid grid-cols-2 gap-2">
            {(['V', 'I', 'R', 'P'] as (keyof F)[]).map((k) => (
              <div key={k} className={`rounded-xl border-2 p-3 text-center ${filled.includes(k) ? 'border-gray-100 bg-gray-50' : 'border-brand-200 bg-brand-50'}`}>
                <div className="text-xs text-gray-400">{t(k === 'V' ? 'ol_voltage' : k === 'I' ? 'ol_current' : k === 'R' ? 'ol_resistance' : 'ol_power')}</div>
                <div className="text-xl font-bold text-gray-900">{fnum(res[k])} <span className="text-sm font-normal text-gray-500">{UNITS[k]}</span></div>
              </div>
            ))}
          </div>
        ) : filled.length > 0 ? (
          <p className="rounded-xl bg-amber-50 text-amber-700 text-sm px-4 py-3">{t('ol_need_two')}</p>
        ) : null}

        <p className="text-xs text-gray-400 text-center font-mono">V = I × R · P = V × I</p>
      </div>
    </ToolLayout>
  )
}
