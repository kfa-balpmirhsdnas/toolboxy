'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { useGameStage, GameStageOverlay, SoundToggle, sfx, useFitCell, scrollGameToTop } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('word-guess')!
const EN = ['apple', 'beach', 'brain', 'bread', 'chair', 'chest', 'cloud', 'dance', 'dream', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'house', 'juice', 'knife', 'light', 'lemon', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'peace', 'phone', 'plant', 'queen', 'river', 'robot', 'smile', 'snake', 'space', 'stone', 'storm', 'sugar', 'table', 'tiger', 'train', 'water', 'world', 'sweet', 'cream', 'frame', 'globe', 'honey']
const KO = ['사과', '바다', '하늘', '구름', '친구', '학교', '가족', '행복', '음악', '영화', '커피', '시간', '사랑', '여행', '바람', '노래', '그림', '책상', '시계', '우산', '나무', '바위', '모래', '가을', '겨울', '여름', '추억', '운동', '공부', '점심', '저녁', '아침', '주말', '건강', '미소', '용기', '지혜', '자유', '평화', '희망', '행운', '보물', '선물', '구두', '장미', '딸기', '포도', '수박', '토끼', '호랑']

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('')
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('')
const JONG = ['_', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
function jamo(word: string): string[] {
  const out: string[] = []
  for (const ch of word) { const c = ch.charCodeAt(0) - 0xac00; if (c < 0 || c > 11171) { out.push(ch); continue } out.push(CHO[Math.floor(c / 588)], JUNG[Math.floor((c % 588) / 28)], JONG[c % 28]) }
  return out
}
function score(guess: string[], answer: string[]): ('g' | 'y' | 'b')[] {
  const res: ('g' | 'y' | 'b')[] = guess.map(() => 'b')
  const rem: Record<string, number> = {}
  answer.forEach((a, i) => { if (guess[i] === a) res[i] = 'g'; else rem[a] = (rem[a] || 0) + 1 })
  guess.forEach((gch, i) => { if (res[i] !== 'g' && rem[gch] > 0) { res[i] = 'y'; rem[gch]-- } })
  return res
}

export default function WordGuessPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [lang, setLang] = useState<'EN' | 'KO'>('KO')
  const [answer, setAnswer] = useState('')
  const [guesses, setGuesses] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [msg, setMsg] = useState('')
  const stage = useGameStage()

  const cols = lang === 'EN' ? 5 : 6
  const [CELL, boxRef] = useFitCell(cols, 6, { reserve: 300, maxCell: 46, gap: 4, pad: 0 })
  const ansJ = lang === 'EN' ? answer.split('') : jamo(answer)

  const reset = useCallback((l: 'EN' | 'KO') => { setLang(l); const bank = l === 'EN' ? EN : KO; setAnswer(bank[Math.floor(Math.random() * bank.length)]); setGuesses([]); setInput(''); setMsg('') }, [])
  useEffect(() => { reset('KO') }, [reset])
  useEffect(() => { if (stage.phase === 'playing') reset(lang) }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = guesses.includes(answer) || guesses.length >= 6
  useEffect(() => { if (done) stage.finish() }, [done]) // eslint-disable-line react-hooks/exhaustive-deps
  function submit() {
    if (!stage.playing || done) return
    const g = input.trim().toLowerCase()
    if (lang === 'EN') { if (!/^[a-z]{5}$/.test(g)) { setMsg(t('wg_len5')); return } }
    else { if (!/^[가-힣]{2}$/.test(input.trim())) { setMsg(t('wg_len2')); return } }
    const word = lang === 'EN' ? g : input.trim()
    const ng = [...guesses, word]; setGuesses(ng); setInput(''); setMsg(''); sfx('move')
    scrollGameToTop() // re-anchor the box top below the header after the keyboard pushed it up
    if (word === answer) { setMsg(t('wg_win', { n: ng.length })); sfx('point') }
    else if (ng.length >= 6) setMsg(t('wg_lose', { a: answer }))
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={boxRef} data-game-stage className="relative w-full max-w-xs mx-auto space-y-4 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('wg_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('wg_subtitle')}</p>
        </div>

        <div className="flex justify-center gap-2 text-sm">
          {(['KO', 'EN'] as const).map((l) => <button key={l} onClick={() => { reset(l); stage.reset() }} className={`px-3 py-1 rounded-full border ${lang === l ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{l === 'KO' ? '한글' : 'English'}</button>)}
        </div>

        <div className="relative space-y-1 w-fit mx-auto">
          {Array.from({ length: 6 }).map((_, r) => {
            const g = guesses[r]
            const gj = g ? (lang === 'EN' ? g.split('') : jamo(g)) : []
            const sc = g ? score(gj, ansJ) : []
            return (
              <div key={r} className="flex gap-1 justify-center">
                {Array.from({ length: cols }).map((_, c) => {
                  const ch = gj[c] === '_' ? '' : gj[c] || ''
                  const st = sc[c]
                  const bg = !g ? 'bg-white border-gray-200' : st === 'g' ? 'bg-emerald-500 text-white border-emerald-500' : st === 'y' ? 'bg-amber-400 text-white border-amber-400' : 'bg-gray-300 text-white border-gray-300'
                  return <div key={c} style={{ width: CELL, height: CELL, fontSize: Math.round(CELL * 0.44) }} className={`rounded border-2 flex items-center justify-center font-bold uppercase ${bg}`}>{ch}</div>
                })}
              </div>
            )
          })}
          <GameStageOverlay stage={stage} />
        </div>

        {!done && (
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} type="search" autoFocus={typeof window !== 'undefined' && window.innerWidth >= 640}
              autoComplete="off" data-1p-ignore data-lpignore="true" maxLength={lang === 'EN' ? 5 : 2} placeholder={lang === 'EN' ? t('wg_ph_en') : t('wg_ph_ko')}
              className="w-32 mx-auto text-center rounded-xl border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={submit} className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium">{t('wg_go')}</button>
          </div>
        )}
        {msg && <p className="font-semibold text-gray-800">{msg}</p>}
        {done && <button onClick={stage.begin} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('wg_new')}</button>}
        <p className="text-xs text-gray-400">{t('wg_note')}</p>
      </div>
    </ToolLayout>
  )
}
