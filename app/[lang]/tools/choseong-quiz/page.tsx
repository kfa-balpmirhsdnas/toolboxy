'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { choseong } from '@/lib/gosaseongeo'

const tool = getToolBySlug('choseong-quiz')!
const WORDS: [string, string][] = [
  ['김치', '음식'], ['비빔밥', '음식'], ['떡볶이', '음식'], ['불고기', '음식'], ['라면', '음식'], ['삼겹살', '음식'],
  ['호랑이', '동물'], ['코끼리', '동물'], ['강아지', '동물'], ['고양이', '동물'], ['기린', '동물'], ['펭귄', '동물'],
  ['대한민국', '나라'], ['일본', '나라'], ['미국', '나라'], ['프랑스', '나라'], ['브라질', '나라'], ['호주', '나라'],
  ['사과', '과일'], ['바나나', '과일'], ['딸기', '과일'], ['수박', '과일'], ['포도', '과일'], ['복숭아', '과일'],
  ['의사', '직업'], ['선생님', '직업'], ['경찰관', '직업'], ['소방관', '직업'], ['요리사', '직업'], ['가수', '직업'],
  ['무지개', '자연'], ['단풍', '자연'], ['폭포', '자연'], ['사막', '자연'], ['화산', '자연'], ['빙하', '자연'],
  ['축구', '스포츠'], ['야구', '스포츠'], ['농구', '스포츠'], ['수영', '스포츠'], ['태권도', '스포츠'], ['마라톤', '스포츠'],
  ['지하철', '일상'], ['도서관', '일상'], ['우산', '일상'], ['안경', '일상'], ['시계', '일상'], ['컴퓨터', '일상'],
]
const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)]

export default function ChoseongQuizPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [q, setQ] = useState<[string, string]>(WORDS[0])
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'' | 'ok' | 'no'>('')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const next = useCallback(() => { setQ(pick()); setInput(''); setResult('') }, [])
  useEffect(() => { next() }, [next])

  function submit() {
    if (result) { next(); return }
    const ok = input.trim() === q[0]
    setResult(ok ? 'ok' : 'no'); setTotal((n) => n + 1); if (ok) setScore((n) => n + 1)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-sm mx-auto space-y-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cq_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cq_subtitle')}</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-100 py-7">
          <div className="text-xs text-brand-600">{q[1]}</div>
          <div className="text-5xl font-bold text-gray-900 tracking-[0.2em] mt-2">{choseong(q[0])}</div>
        </div>

        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} type="search" autoFocus
          autoComplete="off" data-1p-ignore data-lpignore="true" placeholder={t('cq_ph')} disabled={!!result}
          className="w-full text-center rounded-xl border border-gray-200 px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />

        {result === 'ok' && <p className="text-emerald-600 font-semibold">{t('cq_correct')}</p>}
        {result === 'no' && <p className="text-rose-600 font-semibold">{t('cq_wrong', { a: q[0] })}</p>}

        <button onClick={submit} className="w-full px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">{result ? `${t('cq_next')} →` : t('cq_check')}</button>
        <p className="text-sm text-gray-500">{t('cq_score')}: <b className="text-gray-800">{score} / {total}</b></p>
        <p className="text-xs text-gray-400">{t('cq_note')}</p>
      </div>
    </ToolLayout>
  )
}
