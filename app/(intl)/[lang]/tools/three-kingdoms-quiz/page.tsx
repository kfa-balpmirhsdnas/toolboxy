'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { sampleQuestions, LINK_BASE, type TKQuizQ, type TKQuizLevel } from '@/lib/tools/threeKingdomsQuiz'
import { asTKLang, type TKLang } from '@/lib/tools/tkCommon'

const tool = getToolBySlug('three-kingdoms-quiz')!

// 등급 칭호 (90↑ 와룡급 / 70↑ 대도독급 / 50↑ 교위급 / 미만 신병급)
const GRADES: { min: number; label: Record<TKLang, string>; symbol: string; color: string }[] = [
  { min: 90, label: { ko: '와룡급', ja: '臥龍級', en: 'Sleeping Dragon' }, symbol: '智', color: '#10b981' },
  { min: 70, label: { ko: '대도독급', ja: '大都督級', en: 'Grand Commander' }, symbol: '帥', color: '#3b82f6' },
  { min: 50, label: { ko: '교위급', ja: '校尉級', en: 'Captain' }, symbol: '尉', color: '#f59e0b' },
  { min: 0, label: { ko: '신병급', ja: '新兵級', en: 'Recruit' }, symbol: '卒', color: '#9ca3af' },
]

// 문항별 선택지 셔플 결과 (정답의 새 위치 추적)
type Round = { q: TKQuizQ; order: number[] }

export default function ThreeKingdomsQuizPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang: TKLang = asTKLang(params.lang)

  const [stage, setStage] = useState<'start' | 'play' | 'result'>('start')
  const [level, setLevel] = useState<TKQuizLevel>('easy')
  const [rounds, setRounds] = useState<Round[]>([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null) // 셔플된 위치 기준
  const [correct, setCorrect] = useState(0)

  function start(lv: TKQuizLevel) {
    const qs = sampleQuestions(lv, 10)
    setLevel(lv)
    setRounds(qs.map((q) => {
      const order = [0, 1, 2, 3]
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]]
      }
      return { q, order }
    }))
    setIdx(0); setPicked(null); setCorrect(0)
    setStage('play')
  }

  function pick(pos: number) {
    if (picked !== null) return
    setPicked(pos)
    if (rounds[idx].order[pos] === 0) setCorrect((c) => c + 1)
  }
  function nextQ() {
    if (idx + 1 >= rounds.length) { setStage('result'); return }
    setIdx((i) => i + 1); setPicked(null)
  }

  const score = correct * 10
  const grade = GRADES.find((g) => score >= g.min)!

  // 결과 카드 저장 (인물 테스트 카드와 같은 canvas 방식)
  function saveCard() {
    const S = 1080
    const cv = document.createElement('canvas')
    cv.width = S; cv.height = S
    const x = cv.getContext('2d')!
    x.fillStyle = '#111827'; x.fillRect(0, 0, S, S)
    x.fillStyle = grade.color; x.fillRect(0, 0, S, 14)
    x.textAlign = 'center'
    x.beginPath(); x.arc(S / 2, 300, 150, 0, Math.PI * 2); x.strokeStyle = grade.color; x.lineWidth = 10; x.stroke()
    x.fillStyle = grade.color; x.font = 'bold 170px serif'; x.fillText(grade.symbol, S / 2, 360)
    x.fillStyle = '#9ca3af'; x.font = '36px sans-serif'; x.fillText(t('tkz_title'), S / 2, 545)
    x.fillStyle = '#ffffff'; x.font = 'bold 130px sans-serif'; x.fillText(`${score}`, S / 2, 690)
    x.fillStyle = '#d1d5db'; x.font = '40px sans-serif'; x.fillText(`/ 100 · ${t('tkz_lv_' + level)}`, S / 2, 750)
    x.fillStyle = grade.color; x.font = 'bold 56px sans-serif'; x.fillText(grade.label[lang], S / 2, 850)
    x.fillStyle = '#6b7280'; x.font = '30px sans-serif'; x.fillText('toolboxy.net', S / 2, 1042)
    const a = document.createElement('a')
    a.download = `three-kingdoms-quiz-${score}.png`
    a.href = cv.toDataURL('image/png')
    a.click()
  }

  const cur = rounds[idx]

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-xl mx-auto px-4">

        {stage === 'start' && (
          <div className="text-center py-8">
            <p className="text-6xl mb-4">📖</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tkz_title')}</h1>
            <p className="text-gray-500 mb-8">{t('tkz_subtitle')}</p>
            <div className="grid gap-3">
              {(['easy', 'mid', 'hard'] as TKQuizLevel[]).map((lv) => (
                <button key={lv} onClick={() => start(lv)}
                  className="px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-left hover:border-brand-400 hover:bg-brand-50 transition-colors">
                  <p className="font-bold text-gray-900">{t('tkz_lv_' + lv)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('tkz_lv_' + lv + '_d')}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6">{t('tkz_meta')}</p>
          </div>
        )}

        {stage === 'play' && cur && (
          <div className="py-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(idx / rounds.length) * 100}%` }} />
              </div>
              <span className="text-sm text-gray-500 tabular-nums shrink-0">{idx + 1} / {rounds.length}</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <p className="text-lg font-bold text-gray-900 text-center">{cur.q.q[lang]}</p>
            </div>
            <div className="grid gap-2.5">
              {cur.order.map((origIdx, pos) => {
                const isAnswer = origIdx === 0
                const state = picked === null ? ''
                  : isAnswer ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : picked === pos ? 'border-rose-400 bg-rose-50 text-rose-800'
                  : 'opacity-50'
                return (
                  <button key={pos} onClick={() => pick(pos)} disabled={picked !== null}
                    className={`px-5 py-3.5 rounded-2xl border-2 bg-white font-medium text-left transition-colors ${state || 'border-gray-200 hover:border-brand-400'}`}>
                    {cur.q.c[origIdx][lang]}
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-bold mb-1">
                  {rounds[idx].order[picked] === 0
                    ? <span className="text-emerald-600">○ {t('tkz_correct')}</span>
                    : <span className="text-rose-500">✕ {t('tkz_wrong')}</span>}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{cur.q.expl[lang]}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  {cur.q.link ? (
                    <Link href={`/${lang}/tools/${LINK_BASE[cur.q.link.type]}/${cur.q.link.slug}`} target="_blank"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-600 hover:border-brand-200">
                      📎 {t('tkz_learn_more')}
                    </Link>
                  ) : <span />}
                  <button onClick={nextQ} className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold">
                    {idx + 1 >= rounds.length ? t('tkz_see_result') : t('tkz_next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'result' && (
          <div className="py-8 text-center">
            <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: grade.color }}>
              <div className="w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center mb-3" style={{ borderColor: grade.color }}>
                <span className="text-5xl font-bold font-serif" style={{ color: grade.color }}>{grade.symbol}</span>
              </div>
              <p className="text-6xl font-black text-gray-900">{score}<span className="text-2xl text-gray-400 font-bold"> / 100</span></p>
              <p className="mt-2 text-xl font-bold" style={{ color: grade.color }}>{grade.label[lang]}</p>
              <p className="text-xs text-gray-400 mt-1">{t('tkz_lv_' + level)} · {correct} / {rounds.length}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={saveCard} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium">🖼 {t('tkz_save')}</button>
              <button onClick={() => start(level)} className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold">{t('tkz_retry')}</button>
            </div>
            <button onClick={() => setStage('start')} className="mt-2 text-sm text-gray-400 hover:text-gray-600">{t('tkz_change_lv')}</button>

            <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
              <Link href={`/${lang}/tools/three-kingdoms-characters`}
                className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
                👤 {t('tkc_title')}
              </Link>
              <Link href={`/${lang}/tools/three-kingdoms-test`}
                className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-center text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                ⚔️ {t('tk_title')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
