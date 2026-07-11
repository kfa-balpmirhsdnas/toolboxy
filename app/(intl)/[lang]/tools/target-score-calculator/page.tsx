'use client'
import { useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('target-score-calculator')!

type Row = { id: number; name: string; weight: string; score: string } // score '' = not taken yet

export default function TargetScoreCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}

  const [goal, setGoal] = useState('90')
  const [weighted, setWeighted] = useState(false)
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: t('tsc_d_mid'), weight: '40', score: '82' },
    { id: 2, name: t('tsc_d_final'), weight: '60', score: '' },
  ])
  const [nextId, setNextId] = useState(3)

  function add() { setRows(r => [...r, { id: nextId, name: '', weight: '', score: '' }]); setNextId(n => n + 1) }
  function remove(id: number) { setRows(r => r.filter(x => x.id !== id)) }
  function update(id: number, f: 'name' | 'weight' | 'score', v: string) { setRows(r => r.map(x => x.id === id ? { ...x, [f]: v } : x)) }

  const nGoal = Math.min(100, Math.max(0, parseFloat(goal) || 0))
  // Effective weight: entered % in weighted mode, equal split otherwise.
  const w = (r: Row) => weighted ? Math.max(0, parseFloat(r.weight) || 0) : 1
  const totalW = rows.reduce((s, r) => s + w(r), 0)
  const done = rows.filter(r => r.score.trim() !== '')
  const todo = rows.filter(r => r.score.trim() === '')
  const doneSum = done.reduce((s, r) => s + Math.max(0, parseFloat(r.score) || 0) * w(r), 0)
  const todoW = todo.reduce((s, r) => s + w(r), 0)
  // Needed average score on remaining exams so the weighted mean hits the goal.
  const needed = totalW > 0 && todoW > 0 ? (nGoal * totalW - doneSum) / todoW : NaN
  const maxAvg = totalW > 0 ? (doneSum + 100 * todoW) / totalW : 0     // if every remaining exam is 100
  const curAvg = done.length > 0 ? doneSum / done.reduce((s, r) => s + w(r), 0) : 0
  const weightsOff = weighted && Math.abs(totalW - 100) > 0.01

  const inputCls = 'border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tsc_title')}</h1>
        <p className="text-gray-500 mb-8">{t('tsc_subtitle')}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{t('tsc_goal')}</span>
              <input type="number" min={0} max={100} inputMode="decimal" value={goal} onChange={e => setGoal(e.target.value)}
                className={inputCls + ' w-20 text-center text-lg font-semibold'} />
            </label>
            <button onClick={() => setWeighted(v => !v)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (weighted ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-700')}>
              {t('tsc_weighted')}
            </button>
          </div>

          <div className={'grid gap-2 text-xs font-medium text-gray-500 px-1 ' + (weighted ? 'grid-cols-[1fr_5rem_5rem_auto]' : 'grid-cols-[1fr_5rem_auto]')}>
            <span>{t('tsc_exam')}</span>{weighted && <span>{t('tsc_weight')}</span>}<span>{t('tsc_score')}</span><span />
          </div>
          {rows.map(r => (
            <div key={r.id} className={'grid gap-2 items-center ' + (weighted ? 'grid-cols-[1fr_5rem_5rem_auto]' : 'grid-cols-[1fr_5rem_auto]')}>
              <input value={r.name} onChange={e => update(r.id, 'name', e.target.value)} placeholder={t('tsc_exam_ph')} className={inputCls + ' min-w-0'} />
              {weighted && (
                <input type="number" min={0} inputMode="decimal" value={r.weight} onChange={e => update(r.id, 'weight', e.target.value)}
                  placeholder="%" className={inputCls + ' text-center'} />
              )}
              <input type="number" min={0} max={100} inputMode="decimal" value={r.score} onChange={e => update(r.id, 'score', e.target.value)}
                placeholder={t('tsc_score_ph')} className={inputCls + ' text-center'} />
              <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-500">×</button>
            </div>
          ))}
          <button onClick={add} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">{t('tsc_add')}</button>
          {weightsOff && <p className="text-xs text-amber-600">{t('tsc_weight_warn', { n: +totalW.toFixed(1) })}</p>}
        </div>

        {todo.length > 0 && totalW > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6 text-center">
            {isFinite(needed) && needed <= 100 ? (
              <>
                <p className="text-sm text-gray-500">{t('tsc_res_need', { n: todo.length })}</p>
                <p className={'text-6xl font-black my-1 ' + (needed <= 60 ? 'text-green-600' : needed <= 85 ? 'text-blue-600' : 'text-yellow-600')}>
                  {Math.max(0, needed).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">{t('tsc_res_need_tail')}</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-red-500 my-2">{t('tsc_impossible')}</p>
                <p className="text-sm text-gray-600">{t('tsc_max_avg')} <strong className="text-gray-900 text-lg">{maxAvg.toFixed(1)}</strong></p>
              </>
            )}
            {done.length > 0 && (
              <p className="mt-3 text-sm text-gray-500">{t('tsc_cur_avg')} <strong className="text-gray-800">{curAvg.toFixed(1)}</strong></p>
            )}
          </div>
        )}
        {todo.length === 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-500">{t('tsc_all_done')}</div>
        )}

        <div className="mt-8 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{t('atd_related')}</span>
          <Link href={`/${lang}/tools/gpa-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['gpa-calculator'] || 'GPA Calculator'}</Link>
          <Link href={`/${lang}/tools/attendance-calculator`} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">{toolNames['attendance-calculator'] || 'Attendance Calculator'}</Link>
        </div>
      </div>
    </ToolLayout>
  )
}
