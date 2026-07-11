'use client'
import { useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('attendance-calculator')!

// Minimum-attendance presets: label → required fraction. 2/3 is the common
// Korean university F-grade cutoff; custom lets any % be entered.
const PRESETS: { label: string; frac: number }[] = [
  { label: '2/3', frac: 2 / 3 },
  { label: '3/4', frac: 3 / 4 },
  { label: '80%', frac: 0.8 },
  { label: '90%', frac: 0.9 },
]

export default function AttendanceCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}

  const [total, setTotal] = useState('30')
  const [absent, setAbsent] = useState('2')
  const [late, setLate] = useState('0')
  const [lateRule, setLateRule] = useState(3) // N lates = 1 absence; 0 = off
  const [preset, setPreset] = useState(0)     // index into PRESETS, -1 = custom
  const [customPct, setCustomPct] = useState('70')

  const nTotal = Math.max(0, Math.floor(parseFloat(total) || 0))
  const nAbsent = Math.max(0, Math.floor(parseFloat(absent) || 0))
  const nLate = Math.max(0, Math.floor(parseFloat(late) || 0))
  const req = preset >= 0 ? PRESETS[preset].frac : Math.min(100, Math.max(0, parseFloat(customPct) || 0)) / 100

  const effAbsent = nAbsent + (lateRule > 0 ? Math.floor(nLate / lateRule) : 0)
  const maxAbsent = Math.floor(nTotal * (1 - req) + 1e-9)
  const remaining = maxAbsent - effAbsent
  const rate = nTotal > 0 ? Math.max(0, (nTotal - effAbsent) / nTotal * 100) : 0
  const ok = remaining >= 0

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('atd_title')}</h1>
        <p className="text-gray-500 mb-8">{t('atd_subtitle')}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-500">{t('atd_total')}</span>
              <input type="number" min={0} inputMode="numeric" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500">{t('atd_absent')}</span>
              <input type="number" min={0} inputMode="numeric" value={absent} onChange={e => setAbsent(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500">{t('atd_late')}</span>
              <input type="number" min={0} inputMode="numeric" value={late} onChange={e => setLate(e.target.value)} className={inputCls} />
            </label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">{t('atd_late_conv')}</span>
            <select value={lateRule} onChange={e => setLateRule(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
              <option value={0}>{t('atd_off')}</option>
              {[2, 3, 4, 5].map(n => <option key={n} value={n}>{t('atd_late_eq', { n })}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">{t('atd_req')}</span>
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => setPreset(i)}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (preset === i ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-700')}>{p.label}</button>
            ))}
            <button onClick={() => setPreset(-1)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (preset === -1 ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-700')}>{t('atd_custom')}</button>
            {preset === -1 && (
              <span className="inline-flex items-center gap-1">
                <input type="number" min={0} max={100} inputMode="numeric" value={customPct} onChange={e => setCustomPct(e.target.value)}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" />
                <span className="text-sm text-gray-500">%</span>
              </span>
            )}
          </div>
        </div>

        {nTotal > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6 text-center">
            {ok ? (
              <>
                <p className="text-sm text-gray-500">{t('atd_res_left')}</p>
                <p className={'text-6xl font-black my-1 ' + (remaining >= 3 ? 'text-green-600' : remaining >= 1 ? 'text-yellow-600' : 'text-red-500')}>
                  {t('atd_times', { n: remaining })}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-red-500 my-3">{t('atd_fail')}</p>
            )}
            <div className="mt-3 h-3 rounded-full bg-gray-100 overflow-hidden max-w-sm mx-auto">
              <div className={'h-full rounded-full transition-all ' + (rate / 100 >= req ? 'bg-brand-500' : 'bg-red-400')} style={{ width: `${Math.min(100, rate)}%` }} />
            </div>
            <div className="mt-3 flex justify-center gap-4 text-sm text-gray-500 flex-wrap">
              <span>{t('atd_res_rate')} <strong className={rate / 100 >= req ? 'text-gray-800' : 'text-red-500'}>{rate.toFixed(1)}%</strong></span>
              <span>{t('atd_eff', { n: effAbsent })}</span>
              <span>{t('atd_max_abs', { n: Math.max(0, maxAbsent) })}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-3">{t('atd_disclaim')}</p>
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{t('atd_related')}</span>
          <Link href={`/${lang}/tools/gpa-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['gpa-calculator'] || 'GPA Calculator'}</Link>
          <Link href={`/${lang}/tools/grade-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['grade-calculator'] || 'Grade Calculator'}</Link>
        </div>
      </div>
    </ToolLayout>
  )
}
