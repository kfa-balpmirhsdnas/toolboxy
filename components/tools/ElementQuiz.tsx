'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { ELEMENTS, type Element } from '@/lib/elements'

const tool = getToolBySlug('element-quiz')!
const RANGES = [20, 54, 118]
type Mode = 'sym2name' | 'name2sym'

function sample<T>(arr: T[], n: number, exclude: T): T[] {
  const pool = arr.filter((x) => x !== exclude)
  const out: T[] = []
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  return out
}

export default function ElementQuiz({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [mode, setMode] = useState<Mode>('sym2name')
  const [range, setRange] = useState(20)
  const [q, setQ] = useState<{ el: Element; options: Element[] } | null>(null)
  const [picked, setPicked] = useState<Element | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const name = useCallback((e: Element) => (lang === 'ko' ? e.ko : lang === 'ja' ? e.ja : e.en), [lang])

  const next = useCallback(() => {
    const pool = ELEMENTS.slice(0, range)
    const el = pool[Math.floor(Math.random() * pool.length)]
    const options = [el, ...sample(pool, 3, el)].sort(() => Math.random() - 0.5)
    setQ({ el, options }); setPicked(null)
  }, [range])

  useEffect(() => { next(); setScore({ correct: 0, total: 0 }) }, [next, mode])

  function pick(opt: Element) {
    if (picked) return
    setPicked(opt)
    setScore((s) => ({ correct: s.correct + (opt.n === q!.el.n ? 1 : 0), total: s.total + 1 }))
  }

  const promptVal = q ? (mode === 'sym2name' ? q.el.sym : name(q.el)) : ''
  const optLabel = (e: Element) => (mode === 'sym2name' ? name(e) : e.sym)

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('eq_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('eq_subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex gap-1.5">
            {(['sym2name', 'name2sym'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg border ${mode === m ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {t(m === 'sym2name' ? 'eq_mode_sym' : 'eq_mode_name')}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-gray-500">{t('eq_range')}
            <select value={range} onChange={(e) => { setRange(Number(e.target.value)) }} className="rounded-lg border border-gray-200 px-2 py-1.5">
              {RANGES.map((r) => <option key={r} value={r}>1–{r}</option>)}
            </select>
          </label>
        </div>

        {q && (
          <>
            <div className="rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-white py-8 text-center">
              <div className="text-xs text-gray-400 mb-2">{t(mode === 'sym2name' ? 'eq_prompt_sym' : 'eq_prompt_name')}</div>
              <div className="text-5xl font-bold text-gray-900 break-words px-4">{promptVal}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt) => {
                const isCorrect = opt.n === q.el.n
                const state = !picked ? 'idle' : isCorrect ? 'right' : opt.n === picked.n ? 'wrong' : 'dim'
                return (
                  <button key={opt.n} onClick={() => pick(opt)} disabled={!!picked}
                    className={`py-4 rounded-xl border-2 text-lg font-semibold transition ${
                      state === 'idle' ? 'border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-800'
                      : state === 'right' ? 'border-green-500 bg-green-50 text-green-700'
                      : state === 'wrong' ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-100 text-gray-300'}`}>
                    {optLabel(opt)}
                  </button>
                )
              })}
            </div>

            {picked && (
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${picked.n === q.el.n ? 'text-green-600' : 'text-red-600'}`}>
                  {picked.n === q.el.n ? `✓ ${t('eq_correct')}` : `✗ ${q.el.sym} = ${name(q.el)}`}
                </span>
                <button onClick={next} className="btn-primary px-6 py-2">{t('eq_next')} →</button>
              </div>
            )}
          </>
        )}

        <div className="text-center text-sm text-gray-500">{t('eq_score')}: <b className="text-gray-800">{score.correct} / {score.total}</b></div>
        <p className="text-xs text-gray-400 text-center">{t('eq_note')}</p>
      </div>
    </ToolLayout>
  )
}
