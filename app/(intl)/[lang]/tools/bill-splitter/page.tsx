'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('bill-splitter')!
const LOCALE_TAG: Record<string, string> = { en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' }
const CUR: Record<string, { sym: string; dec: number }> = { USD: { sym: '$', dec: 2 }, KRW: { sym: '₩', dec: 0 }, JPY: { sym: '¥', dec: 0 } }
const DEFAULT_CUR: Record<string, string> = { en: 'USD', ja: 'JPY', ko: 'KRW' }
const TIPS = [15, 18, 20]

export default function BillSplitterPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const lang = (['en', 'ja', 'ko'].includes(locale) ? locale : 'en') as 'en' | 'ja' | 'ko'

  const [amount, setAmount] = useState('')
  const [people, setPeople] = useState(2)
  const [cur, setCur] = useState(DEFAULT_CUR[lang])
  const [advanced, setAdvanced] = useState(lang === 'en') // tip is shown by default for EN
  const [tipPct, setTipPct] = useState(0)
  const [tipCustom, setTipCustom] = useState('')
  const [taxOn, setTaxOn] = useState(false)
  const [taxPct, setTaxPct] = useState('')
  const [shareMode, setShareMode] = useState(false)
  const [weights, setWeights] = useState<number[]>([1, 1])
  const [copied, setCopied] = useState(false)

  // keep weights array length in sync with people
  useEffect(() => {
    setWeights((w) => { const n = [...w]; while (n.length < people) n.push(1); return n.slice(0, people) })
  }, [people])

  const { sym, dec } = CUR[cur]
  const scale = Math.pow(10, dec)
  const money = (v: number) => sym + v.toLocaleString(LOCALE_TAG[lang], { minimumFractionDigits: dec, maximumFractionDigits: dec })

  const result = useMemo(() => {
    const subtotal = Math.max(0, parseFloat(amount) || 0)
    const tip = subtotal * (tipPct / 100)
    const tax = taxOn ? subtotal * ((parseFloat(taxPct) || 0) / 100) : 0
    const grand = subtotal + tip + tax
    if (subtotal <= 0 || people < 1) return null
    const G = Math.round(grand * scale) // grand in minor units

    let per: { amount: number; count: number }[] // tiers (equal) or per-person (shares)
    let perPerson: number[] | null = null
    if (shareMode) {
      const w = weights.slice(0, people).map((x) => (x > 0 ? x : 0))
      const sumW = w.reduce((a, b) => a + b, 0) || 1
      const floors = w.map((x) => Math.floor((G * x) / sumW))
      const rema = w.map((x) => (G * x) % sumW)
      let left = G - floors.reduce((a, b) => a + b, 0)
      const order = w.map((_, i) => i).sort((a, b) => rema[b] - rema[a])
      const res = floors.slice()
      for (let i = 0; i < left; i++) res[order[i % res.length]]++
      perPerson = res.map((u) => u / scale)
      per = []
    } else {
      const base = Math.floor(G / people)
      const rem = G - base * people // people who pay base+1 minor unit
      per = rem === 0
        ? [{ amount: base / scale, count: people }]
        : [{ amount: (base + 1) / scale, count: rem }, { amount: base / scale, count: people - rem }]
    }
    return { subtotal, tip, tax, grand, per, perPerson }
  }, [amount, people, tipPct, tipCustom, taxOn, taxPct, shareMode, weights, scale])

  function copy() {
    if (!result) return
    const lines = [`${t('bs_grandtotal')}: ${money(result.grand)} · ${t('bs_ppl', { n: people })}`]
    if (result.perPerson) result.perPerson.forEach((v, i) => lines.push(`${t('bs_person_n', { n: i + 1 })}: ${money(v)}`))
    else result.per.forEach((p) => lines.push(`${money(p.amount)} × ${t('bs_ppl', { n: p.count })}`))
    navigator.clipboard?.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const effTip = (n: number) => { setTipPct(n); setTipCustom('') }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Basic: amount + people + currency */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('bs_total')}</label>
          <div className="flex gap-2">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0"
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-lg font-mono focus:outline-none focus:border-emerald-400" />
            <select value={cur} onChange={(e) => setCur(e.target.value)}
              className="rounded-xl border border-gray-300 px-2 text-sm focus:outline-none focus:border-emerald-400">
              {Object.entries(CUR).map(([k, v]) => <option key={k} value={k}>{v.sym} {k}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('bs_people')}</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="minus" className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"><ToolIcon name="minus" className="w-5 h-5" /></button>
            <input type="number" min={1} value={people} onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center rounded-xl border border-gray-300 px-2 py-2 text-lg font-mono focus:outline-none focus:border-emerald-400" />
            <button onClick={() => setPeople((p) => p + 1)} aria-label="plus" className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"><ToolIcon name="plus" className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Advanced toggle */}
        <button onClick={() => setAdvanced((a) => !a)} className="w-full flex items-center justify-between text-sm font-medium text-gray-600 pt-1">
          <span>⚙️ {t('bs_advanced')}</span><span className="text-gray-400">{advanced ? '▲' : '▼'}</span>
        </button>

        {advanced && (
          <div className="space-y-4 rounded-xl bg-gray-50 p-3">
            {/* Tip */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{t('bs_tip')}</label>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => effTip(0)} className={'px-3 py-1.5 rounded-lg text-sm ' + (tipPct === 0 && !tipCustom ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>0%</button>
                {TIPS.map((n) => <button key={n} onClick={() => effTip(n)} className={'px-3 py-1.5 rounded-lg text-sm ' + (tipPct === n && !tipCustom ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>{n}%</button>)}
                <input value={tipCustom} onChange={(e) => { setTipCustom(e.target.value); setTipPct(parseFloat(e.target.value) || 0) }} inputMode="decimal" placeholder={t('bs_tip_custom')}
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
            </div>
            {/* Tax */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{t('bs_tax')}</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setTaxOn(false)} className={'px-3 py-1.5 rounded-lg text-sm ' + (!taxOn ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>{t('bs_tax_included')}</button>
                <button onClick={() => setTaxOn(true)} className={'px-3 py-1.5 rounded-lg text-sm ' + (taxOn ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>{t('bs_tax_add')}</button>
                {taxOn && <input value={taxPct} onChange={(e) => setTaxPct(e.target.value)} inputMode="decimal" placeholder="%"
                  className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-400" />}
              </div>
            </div>
            {/* Split mode */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{t('bs_split')}</label>
              <div className="flex gap-2">
                <button onClick={() => setShareMode(false)} className={'px-3 py-1.5 rounded-lg text-sm ' + (!shareMode ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>{t('bs_equal')}</button>
                <button onClick={() => setShareMode(true)} className={'px-3 py-1.5 rounded-lg text-sm ' + (shareMode ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}>{t('bs_shares')}</button>
              </div>
              {shareMode && (
                <div className="mt-2 space-y-1.5">
                  {Array.from({ length: people }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">{t('bs_person_n', { n: i + 1 })}</span>
                      <input type="number" min={0} value={weights[i] ?? 1} onChange={(e) => setWeights((w) => { const n = [...w]; n[i] = Math.max(0, parseFloat(e.target.value) || 0); return n })}
                        className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-emerald-400" />
                      <span className="text-xs text-gray-400">{t('bs_weight')}{result?.perPerson ? ` · ${money(result.perPerson[i])}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <div className="text-xs text-emerald-700 uppercase tracking-wide">{t('bs_perperson')}</div>
            {result.perPerson ? (
              <div className="mt-1 text-sm text-gray-700 space-y-0.5">
                {result.perPerson.map((v, i) => <div key={i}>{t('bs_person_n', { n: i + 1 })}: <b className="text-emerald-700">{money(v)}</b></div>)}
              </div>
            ) : result.per.length === 1 ? (
              <div className="text-3xl font-bold text-emerald-700 mt-1">{money(result.per[0].amount)}</div>
            ) : (
              <div className="mt-1">
                <div className="text-3xl font-bold text-emerald-700">{money(result.per[1].amount)}</div>
                <div className="text-sm text-gray-600 mt-1">{t('bs_uneven', { n: result.per[0].count, amt: money(result.per[0].amount) })}</div>
              </div>
            )}
            {(result.tip > 0 || result.tax > 0) && (
              <div className="text-xs text-gray-500 mt-2">
                {t('bs_subtotal')} {money(result.subtotal)}{result.tip > 0 && ` + ${t('bs_tip')} ${money(result.tip)}`}{result.tax > 0 && ` + ${t('bs_tax')} ${money(result.tax)}`} = <b>{money(result.grand)}</b>
              </div>
            )}
            <button onClick={copy} className="mt-3 text-sm px-4 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-100 inline-flex items-center justify-center gap-1.5">{copied ? <><ToolIcon name="check" className="w-4 h-4" />{t('bs_copied')}</> : <><ToolIcon name="copy" className="w-4 h-4" />{t('bs_copy')}</>}</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
