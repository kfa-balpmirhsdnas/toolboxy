// 삼국지 명언 모음 — 원문 출처 확인 가능한 40개만 수록 (t3 ⑦ 규칙).
// 명언 추가 = QuotesData(.2).ts에 객체 추가만 하면 됨.
import { QUOTES_A } from './threeKingdomsQuotesData'
import { QUOTES_B } from './threeKingdomsQuotesData2'
import type { TKL, TKLang, TKSrc } from './tkCommon'

export interface TKQuote {
  slug: string
  hanmun: string      // 원문 (한문)
  person: string      // 공통 인물 ID
  src: TKSrc
  srcName: TKL        // 출전 (정사 몇 전 / 주석 사서 / 연의 몇 회)
  gist: TKL           // 요지 — 검색 타이틀·카드용
  trans: TKL          // 자연스러운 번역 (직역 금지)
  context: TKL        // 발화 맥락 3~5문장
}

export const TK_QUOTES: TKQuote[] = [...QUOTES_A, ...QUOTES_B]
export const TKQ_BY_SLUG: Record<string, TKQuote> = Object.fromEntries(TK_QUOTES.map((q) => [q.slug, q]))

// "오늘의 명언" — 날짜 시드 (고사성어 사전과 동일 방식).
export function quoteOfToday(): TKQuote {
  const d = new Date()
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()
  return TK_QUOTES[seed % TK_QUOTES.length]
}

export const quotesForPerson = (id: string) => TK_QUOTES.filter((q) => q.person === id)

export type { TKLang }
