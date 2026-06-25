'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('scientific-notation-converter')!

function parseInput(raw: string): number {
  let s = raw.trim().replace(/\s+/g, '').replace(/,/g, '')
  s = s.replace(/[×x]10\^?/gi, 'e').replace(/\*10\^?/g, 'e')
  s = s.replace(/(^|[^0-9.])10\^/g, '$11e')
  return parseFloat(s)
}
// expand a number to a plain decimal string (no exponent)
function plain(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '0'
  const neg = n < 0; const a = Math.abs(n)
  const [mant, expS] = a.toExponential().split('e'); const exp = parseInt(expS, 10)
  const [ip, fp = ''] = mant.split('.'); const digits = ip + fp
  const point = ip.length + exp
  let out: string
  if (point <= 0) out = '0.' + '0'.repeat(-point) + digits
  else if (point >= digits.length) out = digits + '0'.repeat(point - digits.length)
  else out = digits.slice(0, point) + '.' + digits.slice(point)
  out = out.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
  return (neg ? '-' : '') + out
}

export default function ScientificNotation({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [input, setInput] = useState('1500000')
  const n = parseInput(input)
  const ok = !isNaN(n) && Number.isFinite(n) && input.trim() !== ''

  let coeff = '', exp = 0
  if (ok && n !== 0) { const [m, e] = n.toExponential().split('e'); coeff = (+(+m).toPrecision(7)).toString(); exp = parseInt(e, 10) }
  else if (ok) { coeff = '0'; exp = 0 }

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="font-mono font-semibold text-gray-900 text-right break-all">{value}</span>
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sn_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('sn_subtitle')}</p>
        </div>

        <input value={input} onChange={(e) => setInput(e.target.value)} autoFocus
          type="text" name="tbx-number" inputMode="text"
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          data-1p-ignore data-lpignore="true" data-bwignore="true" data-form-type="other"
          placeholder={t('sn_placeholder')}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />

        {ok ? (
          <div className="space-y-2">
            {row(t('sn_scientific'), <>{coeff} × 10<sup>{exp}</sup></>)}
            {row(t('sn_enotation'), `${coeff}e${exp}`)}
            {row(t('sn_decimal'), plain(n))}
          </div>
        ) : input.trim() !== '' ? (
          <p className="rounded-xl bg-amber-50 text-amber-700 text-sm px-4 py-3">{t('sn_error')}</p>
        ) : null}

        <p className="text-xs text-gray-400">{t('sn_note')}</p>
      </div>
    </ToolLayout>
  )
}
