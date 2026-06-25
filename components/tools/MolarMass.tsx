'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { BY_SYMBOL } from '@/lib/elements'

const tool = getToolBySlug('molar-mass-calculator')!
const EXAMPLES = ['H2O', 'H2SO4', 'C6H12O6', 'NaCl', 'Ca(OH)2', 'CuSO4·5H2O']

// Parse a chemical formula → { symbol: count }. Throws on invalid input.
function parseFormula(raw: string): Record<string, number> {
  const s = raw.replace(/\s/g, '').replace(/[·*]/g, '.')
  let i = 0
  const num = () => { let n = ''; while (i < s.length && /[0-9]/.test(s[i])) n += s[i++]; return n ? parseInt(n, 10) : 1 }
  const group = (): Record<string, number> => {
    const c: Record<string, number> = {}
    const add = (k: string, v: number) => { c[k] = (c[k] || 0) + v }
    while (i < s.length) {
      const ch = s[i]
      if (ch === '(') { i++; const inner = group(); if (s[i] !== ')') throw new Error('paren'); i++; const m = num(); for (const k in inner) add(k, inner[k] * m) }
      else if (ch === ')') break
      else if (ch === '.') { i++; const m = num(); const inner = group(); for (const k in inner) add(k, inner[k] * m) }
      else if (/[A-Z]/.test(ch)) { let sym = ch; i++; while (i < s.length && /[a-z]/.test(s[i])) sym += s[i++]; if (!BY_SYMBOL[sym]) throw new Error('unknown:' + sym); add(sym, num()) }
      else throw new Error('char:' + ch)
    }
    return c
  }
  const counts = group()
  if (i < s.length || Object.keys(counts).length === 0) throw new Error('invalid')
  return counts
}

export default function MolarMass({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [formula, setFormula] = useState('H2SO4')
  const name = (sym: string) => { const e = BY_SYMBOL[sym]; return lang === 'ko' ? e.ko : lang === 'ja' ? e.ja : e.en }

  let rows: { sym: string; count: number; mass: number }[] | null = null
  let total = 0
  let error = false
  try {
    const counts = parseFormula(formula)
    rows = Object.entries(counts).map(([sym, count]) => ({ sym, count, mass: BY_SYMBOL[sym].mass }))
    total = rows.reduce((s, r) => s + r.count * r.mass, 0)
  } catch { error = formula.trim() !== '' }

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('mm_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('mm_subtitle')}</p>
        </div>

        <input value={formula} onChange={(e) => setFormula(e.target.value)} autoFocus
          type="text" name="tbx-formula" inputMode="text"
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          data-1p-ignore data-lpignore="true" data-bwignore="true" data-form-type="other"
          placeholder={t('mm_placeholder')}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setFormula(ex)}
              className="text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded-lg px-2.5 py-1 text-gray-700">{ex}</button>
          ))}
        </div>

        {error ? (
          <p className="rounded-xl bg-amber-50 text-amber-700 text-sm px-4 py-3">{t('mm_error')}</p>
        ) : rows ? (
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 overflow-hidden">
            <div className="px-5 py-4 text-center">
              <div className="text-xs text-brand-500">{t('mm_result')}</div>
              <div className="text-3xl font-bold text-brand-700">{total.toFixed(2)} <span className="text-base font-normal">g/mol</span></div>
            </div>
            <table className="w-full text-sm bg-white">
              <thead className="text-gray-500 text-xs border-y border-gray-100">
                <tr><th className="text-left px-4 py-1.5">{t('mm_element')}</th><th className="text-right px-2">{t('mm_count')}</th><th className="text-right px-2">{t('pt_mass')}</th><th className="text-right px-4">{t('mm_subtotal')}</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sym} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-1.5"><b>{r.sym}</b> <span className="text-gray-400">{name(r.sym)}</span></td>
                    <td className="text-right px-2 tabular-nums">{r.count}</td>
                    <td className="text-right px-2 tabular-nums text-gray-500">{r.mass}</td>
                    <td className="text-right px-4 tabular-nums">{(r.count * r.mass).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="text-xs text-gray-400">{t('mm_note')}</p>
      </div>
    </ToolLayout>
  )
}
