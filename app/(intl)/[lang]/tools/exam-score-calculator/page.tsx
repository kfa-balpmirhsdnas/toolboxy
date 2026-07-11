'use client'
import { useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('exam-score-calculator')!

// One scored section: question count, points per question, correct answers.
// Multiple sections cover exams like listening 100 + reading 100.
type Sec = { id: number; name: string; questions: string; perQ: string; correct: string }

export default function ExamScoreCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}

  const [secs, setSecs] = useState<Sec[]>([{ id: 1, name: '', questions: '25', perQ: '4', correct: '20' }])
  const [nextId, setNextId] = useState(2)
  const [penalty, setPenalty] = useState('0') // % of a question's points deducted per wrong answer

  function add() { setSecs(s => [...s, { id: nextId, name: '', questions: '', perQ: '', correct: '' }]); setNextId(n => n + 1) }
  function remove(id: number) { setSecs(s => s.filter(x => x.id !== id)) }
  function update(id: number, f: 'name' | 'questions' | 'perQ' | 'correct', v: string) { setSecs(s => s.map(x => x.id === id ? { ...x, [f]: v } : x)) }

  const pRate = Math.max(0, parseFloat(penalty) || 0) / 100
  const calc = secs.map(s => {
    const q = Math.max(0, Math.floor(parseFloat(s.questions) || 0))
    const per = Math.max(0, parseFloat(s.perQ) || 0)
    const c = Math.min(q, Math.max(0, Math.floor(parseFloat(s.correct) || 0)))
    const wrong = q - c
    const score = Math.max(0, c * per - wrong * per * pRate)
    return { ...s, q, per, c, wrong, max: q * per, score }
  })
  const totQ = calc.reduce((a, s) => a + s.q, 0)
  const totC = calc.reduce((a, s) => a + s.c, 0)
  const totMax = calc.reduce((a, s) => a + s.max, 0)
  const totScore = calc.reduce((a, s) => a + s.score, 0)
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

  const inputCls = 'border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('esc_title')}</h1>
        <p className="text-gray-500 mb-8">{t('esc_subtitle')}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-2">
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem_auto] gap-2 text-xs font-medium text-gray-500 px-1">
            <span>{t('esc_section')}</span><span>{t('esc_questions')}</span><span>{t('esc_perq')}</span><span>{t('esc_correct')}</span><span />
          </div>
          {secs.map(s => (
            <div key={s.id} className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem_auto] gap-2 items-center">
              <input value={s.name} onChange={e => update(s.id, 'name', e.target.value)} placeholder={t('esc_section_ph')}
                className={inputCls + ' text-left min-w-0'} />
              <input type="number" min={0} inputMode="numeric" value={s.questions} onChange={e => update(s.id, 'questions', e.target.value)} className={inputCls} />
              <input type="number" min={0} step="0.5" inputMode="decimal" value={s.perQ} onChange={e => update(s.id, 'perQ', e.target.value)} className={inputCls} />
              <input type="number" min={0} inputMode="numeric" value={s.correct} onChange={e => update(s.id, 'correct', e.target.value)} className={inputCls} />
              <button onClick={() => remove(s.id)} className="text-gray-400 hover:text-red-500">×</button>
            </div>
          ))}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <button onClick={add} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">{t('esc_add')}</button>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              {t('esc_penalty')}
              <input type="number" min={0} max={100} inputMode="decimal" value={penalty} onChange={e => setPenalty(e.target.value)}
                className={inputCls + ' w-16'} />
              <span className="text-gray-500">%</span>
            </label>
          </div>
        </div>

        {totQ > 0 && totMax > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">{t('esc_res_score')}</p>
              <p className="text-6xl font-black my-1 text-brand-600">{fmt(totScore)}<span className="text-2xl text-gray-400 font-bold"> / {fmt(totMax)}</span></p>
              <p className="text-sm text-gray-500">
                {t('esc_res_rate')} <strong className="text-gray-800">{(totC / totQ * 100).toFixed(1)}%</strong>
                <span className="mx-2 text-gray-300">·</span>
                {t('esc_res_correct', { c: totC, q: totQ })}
              </p>
            </div>
            {calc.length > 1 && (
              <div className="mt-4 border-t border-gray-100 pt-3 space-y-1">
                {calc.map((s, i) => (
                  <div key={s.id} className="flex justify-between text-sm text-gray-600">
                    <span>{s.name || t('esc_sec_n', { n: i + 1 })}</span>
                    <span className="tabular-nums">{fmt(s.score)} / {fmt(s.max)} <span className="text-gray-400">({s.c}/{s.q})</span></span>
                  </div>
                ))}
              </div>
            )}
            {pRate > 0 && <p className="text-[11px] text-gray-400 mt-3 text-center">{t('esc_penalty_note', { n: +penalty })}</p>}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{t('atd_related')}</span>
          <Link href={`/${lang}/tools/target-score-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['target-score-calculator'] || 'Target Score Calculator'}</Link>
          <Link href={`/${lang}/tools/gpa-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['gpa-calculator'] || 'GPA Calculator'}</Link>
        </div>
      </div>
    </ToolLayout>
  )
}
