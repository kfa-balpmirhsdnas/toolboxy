'use client'

import { useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('area-converter')!
const LOCALE_TAG: Record<string, string> = { en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' }

// Factor = how many square metres in one of this unit.
const UNITS: { k: string; f: number; sym: string; dp: number }[] = [
  { k: 'pyeong', f: 3.3057851, sym: '평', dp: 2 },
  { k: 'sqm', f: 1, sym: '㎡', dp: 2 },
  { k: 'sqft', f: 0.09290304, sym: 'ft²', dp: 1 },
  { k: 'tatami', f: 1.62, sym: '畳', dp: 1 },
  { k: 'acre', f: 4046.8564224, sym: 'ac', dp: 4 },
  { k: 'hectare', f: 10000, sym: 'ha', dp: 4 },
]
const PRIMARY: Record<string, string> = { ko: 'sqm', ja: 'sqm', en: 'sqft' }
const DEFAULTS: Record<string, { unit: string; value: string }> = {
  ko: { unit: 'pyeong', value: '32' }, ja: { unit: 'pyeong', value: '30' }, en: { unit: 'sqm', value: '100' },
}
const COMMON_PYEONG = [18, 24, 25, 32, 34, 40]

export default function AreaConverterPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const lang = (['en', 'ja', 'ko'].includes(locale) ? locale : 'en') as 'en' | 'ja' | 'ko'
  const tag = LOCALE_TAG[lang]
  // pyeong shows as 평 (ko) / 坪 (ja/en)
  const sym = (k: string) => (k === 'pyeong' ? (lang === 'ko' ? '평' : '坪') : UNITS.find((u) => u.k === k)!.sym)
  const name = (k: string) => t('ac_u_' + k)

  const [value, setValue] = useState(DEFAULTS[lang].value)
  const [unit, setUnit] = useState(DEFAULTS[lang].unit)
  const [copied, setCopied] = useState(false)

  const sqm = useMemo(() => (parseFloat(value) || 0) * (UNITS.find((u) => u.k === unit)?.f ?? 1), [value, unit])
  const fmt = (v: number, dp: number) => v.toLocaleString(tag, { maximumFractionDigits: dp })
  const results = UNITS.filter((u) => u.k !== unit).map((u) => ({ k: u.k, v: sqm / u.f, dp: u.dp }))

  function copyAll() {
    const txt = `${fmt(parseFloat(value) || 0, 2)} ${sym(unit)} =\n` + results.map((r) => `${fmt(r.v, r.dp)} ${sym(r.k)} (${name(r.k)})`).join('\n')
    navigator.clipboard?.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">{t('ac_value')}</label>
            <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xl font-mono focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('ac_unit')}</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" style={{ minHeight: '46px' }}>
              {UNITS.map((u) => <option key={u.k} value={u.k}>{sym(u.k)} · {name(u.k)}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {results.map((r) => (
            <div key={r.k} className={'flex items-baseline justify-between px-4 py-2.5 ' + (r.k === PRIMARY[lang] ? 'bg-brand-50' : '')}>
              <span className="text-sm text-gray-500">{name(r.k)} <span className="text-gray-400">{sym(r.k)}</span></span>
              <span className={'font-mono tabular-nums ' + (r.k === PRIMARY[lang] ? 'text-lg font-bold text-brand-700' : 'text-gray-800')}>{fmt(r.v, r.dp)}</span>
            </div>
          ))}
        </div>
        <button onClick={copyAll} className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center gap-1.5">{copied ? <><ToolIcon name="check" className="w-4 h-4" />{t('ac_copied')}</> : <><ToolIcon name="copy" className="w-4 h-4" />{t('ac_copy')}</>}</button>

        {/* Common pyeong quick table — the real-estate hook */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('ac_quick')}</h2>
          <div className="grid grid-cols-3 gap-2">
            {COMMON_PYEONG.map((p) => (
              <button key={p} onClick={() => { setUnit('pyeong'); setValue(String(p)) }}
                className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-center hover:border-brand-300 hover:bg-brand-50">
                <div className="font-bold text-gray-800">{p}{sym('pyeong')}</div>
                <div className="text-xs text-gray-500 font-mono">{fmt(p * 3.3057851, 1)}㎡</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
