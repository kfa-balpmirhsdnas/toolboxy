// 삼국지 퀴즈 — 난이도별 30문항 × 3 = 90 (승인 목록). 플레이 시 10문항 랜덤 출제.
// 논쟁 여지 문항 금지 규칙: 연의/정사가 갈리는 것은 문항에 기준을 명시.
import { QUIZ_EASY } from './threeKingdomsQuizEasy'
import { QUIZ_MID } from './threeKingdomsQuizMid'
import { QUIZ_HARD } from './threeKingdomsQuizHard'
import type { TKL } from './tkCommon'

export interface TKQuizQ {
  id: string
  q: TKL
  c: [TKL, TKL, TKL, TKL]  // c[0] = 정답 (출제 시 셔플)
  expl: TKL                // 1~2문장 해설
  link?: { type: 'char' | 'idiom' | 'battle' | 'quote'; slug: string }
}

export type TKQuizLevel = 'easy' | 'mid' | 'hard'
export const QUIZ_POOL: Record<TKQuizLevel, TKQuizQ[]> = {
  easy: QUIZ_EASY, mid: QUIZ_MID, hard: QUIZ_HARD,
}

export const LINK_BASE: Record<NonNullable<TKQuizQ['link']>['type'], string> = {
  char: 'three-kingdoms-characters',
  idiom: 'three-kingdoms-idioms',
  battle: 'three-kingdoms-battles',
  quote: 'three-kingdoms-quotes',
}

export function sampleQuestions(level: TKQuizLevel, n = 10): TKQuizQ[] {
  const pool = [...QUIZ_POOL[level]]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}
