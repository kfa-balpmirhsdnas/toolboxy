// 삼국지 전투 사전 — 15전. 병력 수는 "기록상" 표기, 정사/연의 차이 단락 필수 (t3 ⑧).
// 전투 추가 = BattlesData(.2).ts에 객체 추가만 하면 됨.
import { BATTLES_A } from './threeKingdomsBattlesData'
import { BATTLES_B } from './threeKingdomsBattlesData2'
import type { TKL, TKFaction } from './tkCommon'

export interface TKBattle {
  id: string
  year: string          // 표기용 ('217–219')
  sortYear: number      // 정렬·연표 점프용
  hanja: string
  name: TKL
  sides: { label: TKL; people: string[] }[]  // 교전 양측 + 주요 지휘관(공통 인물 ID)
  factions: TKFaction[] // 관련 세력 (인덱스 필터)
  background: TKL       // 배경 3~4문장
  course: TKL           // 전개 5~8문장
  outcome: TKL          // 결과와 영향 3~4문장
  diff: TKL             // 정사·연의 차이
  idioms: string[]      // 관련 성어 슬러그
}

export const TK_BATTLES: TKBattle[] = [...BATTLES_A, ...BATTLES_B].sort((a, b) => a.sortYear - b.sortYear)
export const TKB_BY_ID: Record<string, TKBattle> = Object.fromEntries(TK_BATTLES.map((b) => [b.id, b]))

export const battlesForPerson = (id: string) =>
  TK_BATTLES.filter((b) => b.sides.some((s) => s.people.includes(id)))
