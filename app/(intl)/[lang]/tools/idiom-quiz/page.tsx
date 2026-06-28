'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay , SoundToggle, sfx } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'
import { IDIOMS, type Idiom } from '@/lib/gosaseongeo'

const tool = getToolBySlug('idiom-quiz')!
const N = 20, BASE = 5, MAX = N * (BASE + 5)
const sample = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n)
// Speed bonus (0–5) by how fast the answer came in.
const speedBonus = (ms: number) => (ms < 2000 ? 5 : ms < 3500 ? 4 : ms < 5000 ? 3 : ms < 7000 ? 2 : ms < 10000 ? 1 : 0)

type Q = { answer: Idiom; choices: Idiom[] }

export default function IdiomQuizPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [quiz, setQuiz] = useState<Q[]>([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [lastPts, setLastPts] = useState(0)
  const [tick, setTick] = useState(0)
  const qStart = useRef(Date.now())
  const stage = useGameStage()

  function start() {
    const qs = sample(IDIOMS, N).map((answer) => ({
      answer,
      choices: sample([answer, ...sample(IDIOMS.filter((i) => i.id !== answer.id), 3)], 4),
    }))
    setQuiz(qs); setIdx(0); setScore(0); setCorrect(0); setLastPts(0); setPicked(null); qStart.current = Date.now()
  }
  useEffect(() => { start() }, [])
  useEffect(() => { if (stage.phase === 'playing') start() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (quiz.length > 0 && idx >= quiz.length) stage.finish() }, [idx, quiz.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function choose(i: Idiom) {
    if (picked || !stage.playing) return
    setPicked(i.id)
    if (i.id === quiz[idx].answer.id) {
      const p = BASE + speedBonus(Date.now() - qStart.current)
      setScore((n) => n + p); setCorrect((n) => n + 1); setLastPts(p); sfx('point')
    } else { setLastPts(0); sfx('lose') }
  }
  function next() { setPicked(null); setLastPts(0); setIdx((n) => n + 1); qStart.current = Date.now() }
  // After answering, count 5→1 and auto-advance; pressing the button skips ahead.
  useEffect(() => {
    if (!picked) { setTick(0); return }
    setTick(5); let s = 5
    const id = setInterval(() => { s -= 1; setTick(s); if (s <= 0) { clearInterval(id); next() } }, 1000)
    return () => clearInterval(id)
  }, [picked]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!quiz.length) return null
  const finished = idx >= quiz.length

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-md mx-auto space-y-5 text-center">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('iq_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('iq_subtitle')}</p>
        </div>

        <div className="relative">
        {finished ? (
          <>
            <div className="rounded-2xl border-2 border-brand-100 bg-brand-50 py-8 px-4">
              <div className="text-sm text-brand-700">{t('quiz_done')}</div>
              <div className="text-4xl font-extrabold text-brand-700 mt-2">{score} <span className="text-xl text-brand-400">/ {MAX}</span></div>
              <div className="text-xs text-gray-500 mt-2">{correct} / {N}</div>
            </div>
            <button onClick={stage.begin} className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">↻ {t('quiz_again')}</button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{idx + 1} / {N}</span>
              <span>{t('quiz_total')} <b className="text-gray-800">{score}</b></span>
            </div>

            <div className="rounded-2xl border-2 border-gray-100 py-7 px-4">
              <div className="text-xs text-gray-400">{t('iq_ask')}</div>
              <div className="text-lg font-medium text-gray-800 mt-2">{quiz[idx].answer.fig}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quiz[idx].choices.map((c) => {
                const right = c.id === quiz[idx].answer.id
                const cls = !picked ? 'border-gray-200 hover:border-brand-400' : right ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : c.id === picked ? 'bg-rose-100 border-rose-400 text-rose-800' : 'opacity-60 border-gray-200'
                return (
                  <button key={c.id} onClick={() => choose(c)} disabled={!!picked} className={`px-3 py-3 rounded-xl border-2 ${cls}`}>
                    <div className="text-xl font-bold" style={{ fontFamily: 'serif' }}>{c.hanja}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.reading}</div>
                  </button>
                )
              })}
            </div>

            {picked && (
              <div className="space-y-3">
                <div className={`text-sm font-bold ${lastPts > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{lastPts > 0 ? `+${lastPts}${lastPts > BASE ? ' ⚡' : ''}` : '+0'}</div>
                <button onClick={next} className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">{idx + 1 < N ? t('iq_next') : t('quiz_finish')} <span className="inline-flex items-center justify-center w-6 h-6 ml-1 rounded-full bg-white/25 text-sm tabular-nums">{tick}</span></button>
              </div>
            )}
          </>
        )}
          <GameStageOverlay stage={stage} />
        </div>

        <Leaderboard game="idiom-quiz" score={finished && score > 0 ? score : null} better="higher" />
      </div>
    </ToolLayout>
  )
}
