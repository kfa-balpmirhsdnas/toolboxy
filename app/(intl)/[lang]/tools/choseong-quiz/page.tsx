'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay, SoundToggle, sfx, scrollGameToTop } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'
import { choseong } from '@/lib/gosaseongeo'

const tool = getToolBySlug('choseong-quiz')!
const N = 20, BASE = 5, MAX = N * (BASE + 5)
const sample = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n)
const speedBonus = (ms: number) => (ms < 2500 ? 5 : ms < 4000 ? 4 : ms < 6000 ? 3 : ms < 8500 ? 2 : ms < 12000 ? 1 : 0)
const WORDS: [string, string][] = [
  ['김치', '음식'], ['비빔밥', '음식'], ['떡볶이', '음식'], ['불고기', '음식'], ['라면', '음식'], ['삼겹살', '음식'], ['김밥', '음식'], ['짜장면', '음식'], ['만두', '음식'], ['치킨', '음식'], ['피자', '음식'], ['갈비', '음식'], ['순두부', '음식'], ['칼국수', '음식'], ['잡채', '음식'],
  ['호랑이', '동물'], ['코끼리', '동물'], ['강아지', '동물'], ['고양이', '동물'], ['기린', '동물'], ['펭귄', '동물'], ['사자', '동물'], ['토끼', '동물'], ['다람쥐', '동물'], ['원숭이', '동물'], ['악어', '동물'], ['하마', '동물'], ['늑대', '동물'], ['여우', '동물'], ['캥거루', '동물'],
  ['대한민국', '나라'], ['일본', '나라'], ['미국', '나라'], ['프랑스', '나라'], ['브라질', '나라'], ['호주', '나라'], ['독일', '나라'], ['영국', '나라'], ['중국', '나라'], ['캐나다', '나라'], ['이탈리아', '나라'], ['스페인', '나라'], ['인도', '나라'], ['멕시코', '나라'], ['태국', '나라'],
  ['사과', '과일'], ['바나나', '과일'], ['딸기', '과일'], ['수박', '과일'], ['포도', '과일'], ['복숭아', '과일'], ['참외', '과일'], ['오렌지', '과일'], ['키위', '과일'], ['망고', '과일'], ['파인애플', '과일'], ['자두', '과일'], ['감', '과일'], ['귤', '과일'], ['체리', '과일'],
  ['의사', '직업'], ['선생님', '직업'], ['경찰관', '직업'], ['소방관', '직업'], ['요리사', '직업'], ['가수', '직업'], ['변호사', '직업'], ['간호사', '직업'], ['화가', '직업'], ['군인', '직업'], ['농부', '직업'], ['배우', '직업'], ['기자', '직업'], ['우주인', '직업'], ['미용사', '직업'],
  ['무지개', '자연'], ['단풍', '자연'], ['폭포', '자연'], ['사막', '자연'], ['화산', '자연'], ['빙하', '자연'], ['번개', '자연'], ['안개', '자연'], ['노을', '자연'], ['동굴', '자연'], ['계곡', '자연'], ['호수', '자연'], ['들판', '자연'], ['절벽', '자연'], ['바다', '자연'],
  ['축구', '스포츠'], ['야구', '스포츠'], ['농구', '스포츠'], ['수영', '스포츠'], ['태권도', '스포츠'], ['마라톤', '스포츠'], ['배구', '스포츠'], ['탁구', '스포츠'], ['골프', '스포츠'], ['스키', '스포츠'], ['권투', '스포츠'], ['양궁', '스포츠'], ['펜싱', '스포츠'], ['배드민턴', '스포츠'], ['볼링', '스포츠'],
  ['지하철', '일상'], ['도서관', '일상'], ['우산', '일상'], ['안경', '일상'], ['시계', '일상'], ['컴퓨터', '일상'], ['칫솔', '일상'], ['가방', '일상'], ['신발', '일상'], ['베개', '일상'], ['냉장고', '일상'], ['세탁기', '일상'], ['휴대폰', '일상'], ['자전거', '일상'], ['텔레비전', '일상'],
]

export default function ChoseongQuizPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [quiz, setQuiz] = useState<[string, string][]>([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'' | 'ok' | 'no'>('')
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [lastPts, setLastPts] = useState(0)
  const [tick, setTick] = useState(0)
  const qStart = useRef(Date.now())
  const stage = useGameStage()

  function start() { setQuiz(sample(WORDS, Math.min(N, WORDS.length))); setIdx(0); setInput(''); setResult(''); setScore(0); setCorrect(0); setLastPts(0); qStart.current = Date.now() }
  useEffect(() => { start() }, [])
  useEffect(() => { if (stage.phase === 'playing') start() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (quiz.length > 0 && idx >= quiz.length) stage.finish() }, [idx, quiz.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function submit() {
    if (!stage.playing) return
    scrollGameToTop() // re-anchor the box top below the header after the keyboard pushed it up
    if (result) { setIdx((n) => n + 1); setInput(''); setResult(''); setLastPts(0); qStart.current = Date.now(); return }
    const ok = input.trim() === quiz[idx][0]
    setResult(ok ? 'ok' : 'no')
    if (ok) { const p = BASE + speedBonus(Date.now() - qStart.current); setScore((n) => n + p); setCorrect((n) => n + 1); setLastPts(p); sfx('point') } else { setLastPts(0); sfx('lose') }
  }
  // After answering, count 5→1 and auto-advance; pressing the button skips ahead.
  useEffect(() => {
    if (!result) { setTick(0); return }
    setTick(5); let s = 5
    const id = setInterval(() => { s -= 1; setTick(s); if (s <= 0) { clearInterval(id); submit() } }, 1000)
    return () => clearInterval(id)
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!quiz.length) return null
  const finished = idx >= quiz.length

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div data-game-stage className="relative max-w-sm mx-auto space-y-4 text-center">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cq_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cq_subtitle')}</p>
        </div>

        <div className="relative">
        {finished ? (
          <>
            <div className="rounded-2xl border-2 border-brand-100 bg-brand-50 py-8 px-4">
              <div className="text-sm text-brand-700">{t('quiz_done')}</div>
              <div className="text-4xl font-extrabold text-brand-700 mt-2">{score} <span className="text-xl text-brand-400">/ {MAX}</span></div>
              <div className="text-xs text-gray-500 mt-2">{correct} / {N}</div>
            </div>
            <button onClick={stage.begin} className="w-full px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 inline-flex items-center justify-center gap-1.5"><ToolIcon name="refresh" className="w-4 h-4" />{t('quiz_again')}</button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{idx + 1} / {N}</span>
              <span>{t('quiz_total')} <b className="text-gray-800">{score}</b></span>
            </div>

            <div className="rounded-2xl border-2 border-gray-100 py-7">
              <div className="text-xs text-brand-600">{quiz[idx][1]}</div>
              <div className="text-5xl font-bold text-gray-900 tracking-[0.2em] mt-2">{choseong(quiz[idx][0])}</div>
            </div>

            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} type="search" autoFocus={typeof window !== 'undefined' && window.innerWidth >= 640}
              autoComplete="off" data-1p-ignore data-lpignore="true" placeholder={t('cq_ph')} disabled={!!result}
              className="w-full text-center rounded-xl border border-gray-200 px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />

            {result === 'ok' && <p className="text-emerald-600 font-semibold">{t('cq_correct')} +{lastPts}{lastPts > BASE ? ' ⚡' : ''}</p>}
            {result === 'no' && <p className="text-rose-600 font-semibold">{t('cq_wrong', { a: quiz[idx][0] })}</p>}

            <button onClick={submit} className="w-full px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700">{result ? (<>{idx + 1 < N ? t('cq_next') : t('quiz_finish')} <span className="inline-flex items-center justify-center w-6 h-6 ml-1 rounded-full bg-white/25 text-sm tabular-nums">{tick}</span></>) : t('cq_check')}</button>
            <p className="text-xs text-gray-400">{t('cq_note')}</p>
          </>
        )}
          <GameStageOverlay stage={stage} />
        </div>

        <Leaderboard game="choseong-quiz" score={finished && score > 0 ? score : null} better="higher" />
      </div>
    </ToolLayout>
  )
}
