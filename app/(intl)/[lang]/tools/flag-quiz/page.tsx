'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, flag, cName, type Country } from '@/lib/countries'

const tool = getToolBySlug('flag-quiz')!
const pick = <T,>(arr: T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

export default function FlagQuizPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [q, setQ] = useState<{ answer: Country; choices: Country[] } | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  function next() {
    const answer = pick(COUNTRIES, 1)[0]
    const distractors = pick(COUNTRIES.filter((c) => c.code !== answer.code), 3)
    setQ({ answer, choices: pick([answer, ...distractors], 4) })
    setPicked(null)
  }
  useEffect(() => { next() }, [])

  function choose(c: Country) {
    if (picked) return
    setPicked(c.code); setTotal((n) => n + 1)
    if (c.code === q!.answer.code) setScore((n) => n + 1)
  }

  if (!q) return null
  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-sm mx-auto space-y-5 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('fq_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('fq_subtitle')}</p>
        </div>

        <div className="text-[7rem] leading-none">{flag(q.answer.code)}</div>

        <div className="grid grid-cols-1 gap-2">
          {q.choices.map((c) => {
            const isAnswer = c.code === q.answer.code
            const state = !picked ? '' : isAnswer ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : c.code === picked ? 'bg-rose-100 border-rose-400 text-rose-800' : 'opacity-60'
            return (
              <button key={c.code} onClick={() => choose(c)} disabled={!!picked}
                className={`px-4 py-2.5 rounded-xl border-2 font-medium ${state || 'border-gray-200 hover:border-brand-400'}`}>{cName(c, lang)}</button>
            )
          })}
        </div>

        {picked && <button onClick={next} className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">{t('fq_next')}<ToolIcon name="chevron-right" className="w-4 h-4" /></button>}
        <p className="text-sm text-gray-500">{t('fq_score')}: <b className="text-gray-800">{score} / {total}</b></p>
      </div>
    </ToolLayout>
  )
}
