'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('resistor-color-code')!

const HEX: Record<string, string> = { black: '#1f2937', brown: '#92400e', red: '#dc2626', orange: '#ea580c', yellow: '#facc15', green: '#16a34a', blue: '#2563eb', violet: '#7c3aed', grey: '#6b7280', white: '#f3f4f6', gold: '#d4af37', silver: '#cbd5e1', none: '#e5e7eb' }
const NAMES: Record<string, Record<string, string>> = {
  en: { black: 'Black', brown: 'Brown', red: 'Red', orange: 'Orange', yellow: 'Yellow', green: 'Green', blue: 'Blue', violet: 'Violet', grey: 'Grey', white: 'White', gold: 'Gold', silver: 'Silver', none: 'None' },
  ko: { black: '검정', brown: '갈색', red: '빨강', orange: '주황', yellow: '노랑', green: '초록', blue: '파랑', violet: '보라', grey: '회색', white: '흰색', gold: '금색', silver: '은색', none: '없음' },
  ja: { black: '黒', brown: '茶', red: '赤', orange: '橙', yellow: '黄', green: '緑', blue: '青', violet: '紫', grey: '灰', white: '白', gold: '金', silver: '銀', none: 'なし' },
}
const DIGIT = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white']
const MULT: [string, number][] = [['black', 1], ['brown', 10], ['red', 100], ['orange', 1e3], ['yellow', 1e4], ['green', 1e5], ['blue', 1e6], ['violet', 1e7], ['grey', 1e8], ['white', 1e9], ['gold', 0.1], ['silver', 0.01]]
const TOL: [string, number][] = [['brown', 1], ['red', 2], ['green', 0.5], ['blue', 0.25], ['violet', 0.1], ['grey', 0.05], ['gold', 5], ['silver', 10], ['none', 20]]

function fmt(ohm: number): string {
  if (ohm >= 1e9) return +(ohm / 1e9).toPrecision(4) + ' GΩ'
  if (ohm >= 1e6) return +(ohm / 1e6).toPrecision(4) + ' MΩ'
  if (ohm >= 1e3) return +(ohm / 1e3).toPrecision(4) + ' kΩ'
  return +ohm.toPrecision(4) + ' Ω'
}

export default function ResistorColorCode({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const nm = NAMES[lang] || NAMES.en
  const [bands, setBands] = useState(4)
  const [b, setB] = useState<string[]>(['brown', 'black', 'red', 'gold']) // d1 d2 (d3) mult tol

  const set = (i: number, v: string) => setB((p) => { const c = [...p]; c[i] = v; return c })

  // indices depend on band count
  const digits = bands === 5 ? [b[0], b[1], b[2]] : [b[0], b[1]]
  const multIdx = bands === 5 ? 3 : 2
  const tolIdx = bands === 5 ? 4 : 3
  const digitVal = digits.reduce((acc, c) => acc * 10 + DIGIT.indexOf(c), 0)
  const mult = (MULT.find((m) => m[0] === b[multIdx]) || [, 1])[1] as number
  const ohm = digitVal * mult
  const tol = (TOL.find((x) => x[0] === b[tolIdx]) || [, 20])[1] as number

  const swatch = (c: string) => (<span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle border border-gray-300" style={{ background: HEX[c] }} />)
  const sel = (i: number, opts: string[], label: string) => (
    <label className="flex flex-col gap-1 text-xs text-gray-500">{label}
      <select value={b[i]} onChange={(e) => set(i, e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm" style={{ background: HEX[b[i]] + '22' }}>
        {opts.map((c) => <option key={c} value={c}>{nm[c]}</option>)}
      </select>
    </label>
  )

  // resistor visual: body + bands
  const bandCols = bands === 5 ? [b[0], b[1], b[2], b[multIdx], b[tolIdx]] : [b[0], b[1], b[multIdx], b[tolIdx]]

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('rc_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('rc_subtitle')}</p>
        </div>

        {/* resistor */}
        <div className="flex items-center justify-center py-4">
          <div className="h-1 w-8 bg-gray-400" />
          <div className="relative h-12 w-44 rounded-lg bg-[#e8d8b0] flex items-center justify-around px-3 shadow-inner">
            {bandCols.map((c, i) => <div key={i} className="h-12 w-2.5 rounded-sm" style={{ background: HEX[c] }} />)}
          </div>
          <div className="h-1 w-8 bg-gray-400" />
        </div>

        {/* result */}
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 py-4 text-center">
          <div className="text-3xl font-bold text-brand-700">{fmt(ohm)} <span className="text-base font-normal text-gray-500">±{tol}%</span></div>
        </div>

        {/* band count */}
        <div className="flex gap-2 text-sm">
          {[4, 5].map((n) => (
            <button key={n} onClick={() => setBands(n)} className={`px-3 py-1.5 rounded-lg border ${bands === n ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{n}{t('rc_band_unit')}</button>
          ))}
        </div>

        {/* selects */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {sel(0, DIGIT, '1 · ' + t('rc_digit'))}
          {sel(1, DIGIT, '2 · ' + t('rc_digit'))}
          {bands === 5 && sel(2, DIGIT, '3 · ' + t('rc_digit'))}
          {sel(multIdx, MULT.map((m) => m[0]), t('rc_multiplier'))}
          {sel(tolIdx, TOL.map((x) => x[0]), t('rc_tolerance'))}
        </div>

        <p className="text-xs text-gray-400">{t('rc_note')}</p>
      </div>
    </ToolLayout>
  )
}
