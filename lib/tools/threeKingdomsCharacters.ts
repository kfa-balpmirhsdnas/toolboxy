// 삼국지 인물 사전 — 허브 도구. 인물 ID(cao-cao 등)는 시리즈 전 도구 공통 키.
// 인물 추가 = CharsWei/Shu/Wu/Other 데이터 파일에 객체 추가만 하면 됨 (100명+ 확장 전제).
import { CHARS_WEI } from './threeKingdomsCharsWei'
import { CHARS_SHU } from './threeKingdomsCharsShu'
import { CHARS_WU } from './threeKingdomsCharsWu'
import { CHARS_OTHER } from './threeKingdomsCharsOther'
import type { TKL, TKLang, TKFaction } from './tkCommon'

export type TKRole = 'civil' | 'military' | 'both' | 'other'

export interface TKChar {
  id: string                 // 공통 인물 ID (병음 하이픈)
  hanja: string
  name: TKL
  courtesy?: { hanja: string; read: TKL }  // 자(字)
  posthumous?: TKL           // 시호 (유명한 것만)
  birth: string; death: string             // '155' / '?' — 정사 기준
  faction: TKFaction         // 대표 세력 (필터·배지)
  factionNote?: TKL          // 세력 변천 (있을 때만 표기)
  role: TKRole
  fictional?: boolean        // 연의 창작 인물 (초선)
  intro: TKL                 // 5문장 내외 소개
  imageDiff: TKL             // 정사/연의 이미지 차이 한 단락
}

export const TK_CHARS: TKChar[] = [...CHARS_WEI, ...CHARS_SHU, ...CHARS_WU, ...CHARS_OTHER]
export const TKC_BY_ID: Record<string, TKChar> = Object.fromEntries(TK_CHARS.map((c) => [c.id, c]))

export const ROLE_LABEL: Record<TKRole, TKL> = {
  civil: { ko: '문관', ja: '文官', en: 'Civil' },
  military: { ko: '무장', ja: '武将', en: 'Military' },
  both: { ko: '문무겸비', ja: '文武両道', en: 'Civil & military' },
  other: { ko: '기타', ja: 'その他', en: 'Other' },
}

export const tkcName = (c: TKChar, lang: TKLang) => c.name[lang]
