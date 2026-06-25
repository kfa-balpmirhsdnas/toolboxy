'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { IDIOMS, type Idiom } from '@/lib/gosaseongeo'

const tool = getToolBySlug('idiom-quiz')!
const pick = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n)

export default function IdiomQuizPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [q, setQ] = useState<{ answer: Idiom; choices: Idiom[] } | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  function next() {
    const answer = pick(IDIOMS, 1)[0]
    setQ({ answer, choices: pick([answer, ...pick(IDIOMS.filter((i) => i.id !== answer.id), 3)], 4) })
    setPicked(null)
  }
  useEffect(() => { next() }, [])
  function choose(i: Idiom) { if (picked) return; setPicked(i.id); setTotal((n) => n + 1); if (i.id === q!.answer.id) setScore((n) => n + 1) }

  if (!q) return null
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('iq_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('iq_subtitle')}</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-100 py-7 px-4">
          <div className="text-xs text-gray-400">{t('iq_ask')}</div>
          <div className="text-lg font-medium text-gray-800 mt-2">{q.answer.fig}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {q.choices.map((c) => {
            const right = c.id === q.answer.id
            const cls = !picked ? 'border-gray-200 hover:border-brand-400' : right ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : c.id === picked ? 'bg-rose-100 border-rose-400 text-rose-800' : 'opacity-60 border-gray-200'
            return (
              <button key={c.id} onClick={() => choose(c)} disabled={!!picked} className={`px-3 py-3 rounded-xl border-2 ${cls}`}>
                <div className="text-xl font-bold" style={{ fontFamily: 'serif' }}>{c.hanja}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.reading}</div>
              </button>
            )
          })}
        </div>

        {picked && <button onClick={next} className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">{t('iq_next')} →</button>}
        <p className="text-sm text-gray-500">{t('iq_score')}: <b className="text-gray-800">{score} / {total}</b></p>
      </div>
    </ToolLayout>
  )
}
