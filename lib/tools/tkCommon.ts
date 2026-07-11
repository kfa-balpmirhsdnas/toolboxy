// 삼국지 시리즈 공통 모듈 — 언어/출처 배지/세력 메타.
// 전 도구(성어·인물·명언·전투·연표·퀴즈)가 이 정의를 공유한다 (t3 공통 규칙).

export type TKLang = 'ko' | 'ja' | 'en'
export type TKL<T = string> = Record<TKLang, T>

export const asTKLang = (l: string): TKLang => (l === 'ko' || l === 'ja' ? l : 'en')

// 출처 구분 — 정사 / 정사 주석 / 연의(소설) / 후대 기록. 시리즈 신뢰도의 핵심 장치.
export type TKSrc = 'history' | 'annot' | 'novel' | 'later'
export const SRC_META: Record<TKSrc, { label: TKL; color: string }> = {
  history: { label: { ko: '정사', ja: '正史', en: 'History' }, color: '#10b981' },
  annot: { label: { ko: '정사 주석', ja: '正史注釈', en: 'Annotations' }, color: '#3b82f6' },
  novel: { label: { ko: '연의 (소설)', ja: '演義（小説）', en: 'Novel' }, color: '#f59e0b' },
  later: { label: { ko: '후대 기록', ja: '後代の記録', en: 'Later record' }, color: '#8b5cf6' },
}

// 세력 5분류 — 대표 세력 배지/필터용. 색상은 시리즈 공통(위=파랑·촉=초록·오=빨강·후한=보라·군벌=호박).
export type TKFaction = 'wei' | 'shu' | 'wu' | 'han' | 'other'
export const FACTION_META: Record<TKFaction, { label: TKL; color: string }> = {
  wei: { label: { ko: '위', ja: '魏', en: 'Wei' }, color: '#3b82f6' },
  shu: { label: { ko: '촉', ja: '蜀', en: 'Shu' }, color: '#10b981' },
  wu: { label: { ko: '오', ja: '呉', en: 'Wu' }, color: '#ef4444' },
  han: { label: { ko: '후한 조정', ja: '後漢朝廷', en: 'Han court' }, color: '#8b5cf6' },
  other: { label: { ko: '군벌·기타', ja: '群雄・その他', en: 'Warlords' }, color: '#f59e0b' },
}
