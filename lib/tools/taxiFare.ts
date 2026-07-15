// 택시 요금 계산 — 순수 함수 + 도시별 요금표 (taxi2.md).
// 요금표는 공식 고시/협회 발표값 (2026-07 조사). 요금 개정 시 이 파일 데이터만 갱신.
// 심야 할증이 시간대별 밴드(서울 20~40% 등)라 단일 %가 아닌 min~max 범위로 계산·표시한다.

export type TaxiCountry = 'KR' | 'JP'
export type TaxiLang = 'ko' | 'ja' | 'en'
export const asTaxiLang = (l: string): TaxiLang => (l === 'ja' || l === 'en' ? l : 'ko')

export interface TaxiTariff {
  id: string
  country: TaxiCountry
  currency: 'KRW' | 'JPY'
  label: Record<TaxiLang, string>
  baseFare: number // 기본요금
  baseDistanceM: number // 기본거리
  unitFare: number // 거리요금 단가
  unitDistanceM: number // 거리요금 단위(m)
  timeFare: number // 시간요금 단가 (저속 시간거리병산)
  timeUnitSec: number // 시간요금 단위(초)
  nightPctMin: number // 심야 할증 최소 %
  nightPctMax: number // 심야 할증 최대 % (밴드형이면 min≠max)
  nightHours: string // 심야 시간대 표기
  source: string // 근거 (공식 고시/발표)
  updated: string // 기준일
}

export const TAXI_TARIFFS: TaxiTariff[] = [
  {
    id: 'KR-seoul', country: 'KR', currency: 'KRW',
    label: { ko: '서울', ja: 'ソウル', en: 'Seoul' },
    baseFare: 4800, baseDistanceM: 1600,
    unitFare: 100, unitDistanceM: 131,
    timeFare: 100, timeUnitSec: 30,
    nightPctMin: 20, nightPctMax: 40, nightHours: '22:00–04:00',
    source: '서울특별시 택시요금 고시 (news.seoul.go.kr/traffic/archives/1659)', updated: '2026-07',
  },
  {
    id: 'KR-busan', country: 'KR', currency: 'KRW',
    label: { ko: '부산', ja: '釜山', en: 'Busan' },
    baseFare: 4800, baseDistanceM: 2000,
    unitFare: 100, unitDistanceM: 132,
    timeFare: 100, timeUnitSec: 33,
    nightPctMin: 20, nightPctMax: 30, nightHours: '23:00–04:00',
    source: '부산광역시 2023-06-01 요금 조정 발표 (busan.go.kr)', updated: '2026-07',
  },
  {
    id: 'KR-incheon', country: 'KR', currency: 'KRW',
    label: { ko: '인천', ja: '仁川', en: 'Incheon' },
    baseFare: 4800, baseDistanceM: 1600,
    unitFare: 100, unitDistanceM: 135,
    timeFare: 100, timeUnitSec: 33,
    nightPctMin: 20, nightPctMax: 40, nightHours: '22:00–04:00',
    source: '인천광역시 2023-07-01 요금 조정 고시', updated: '2026-07',
  },
  {
    id: 'KR-daegu', country: 'KR', currency: 'KRW',
    label: { ko: '대구', ja: '大邱', en: 'Daegu' },
    baseFare: 4500, baseDistanceM: 1700,
    unitFare: 100, unitDistanceM: 125,
    timeFare: 100, timeUnitSec: 31,
    nightPctMin: 20, nightPctMax: 30, nightHours: '23:00–04:00',
    source: '대구광역시 2025-02-22 요금 조정', updated: '2026-07',
  },
  {
    id: 'KR-daejeon', country: 'KR', currency: 'KRW',
    label: { ko: '대전', ja: '大田', en: 'Daejeon' },
    baseFare: 4300, baseDistanceM: 1800,
    unitFare: 100, unitDistanceM: 132,
    timeFare: 100, timeUnitSec: 33,
    nightPctMin: 20, nightPctMax: 20, nightHours: '23:00–04:00',
    source: '대전광역시 2023-07-01 요금 조정', updated: '2026-07',
  },
  {
    id: 'KR-gwangju', country: 'KR', currency: 'KRW',
    label: { ko: '광주', ja: '光州', en: 'Gwangju' },
    baseFare: 4800, baseDistanceM: 1700,
    unitFare: 100, unitDistanceM: 132,
    timeFare: 100, timeUnitSec: 32,
    nightPctMin: 20, nightPctMax: 30, nightHours: '23:00–04:00',
    source: '광주광역시 2025-10-22 요금 조정', updated: '2026-07',
  },
  {
    id: 'KR-jeju', country: 'KR', currency: 'KRW',
    label: { ko: '제주', ja: '済州', en: 'Jeju' },
    baseFare: 4300, baseDistanceM: 2000,
    unitFare: 100, unitDistanceM: 127,
    timeFare: 100, timeUnitSec: 31,
    nightPctMin: 20, nightPctMax: 20, nightHours: '23:00–04:00',
    source: '제주특별자치도 2024-07-01 요금 조정 (jeju.go.kr)', updated: '2026-07',
  },
  {
    id: 'JP-tokyo', country: 'JP', currency: 'JPY',
    label: { ko: '도쿄 (23구)', ja: '東京（23区）', en: 'Tokyo (23 wards)' },
    baseFare: 500, baseDistanceM: 1000,
    unitFare: 100, unitDistanceM: 232,
    timeFare: 100, timeUnitSec: 85,
    nightPctMin: 20, nightPctMax: 20, nightHours: '22:00–05:00',
    source: '東京特別区・武三地区 2026-04-20 운임 개정', updated: '2026-07',
  },
  {
    id: 'JP-osaka', country: 'JP', currency: 'JPY',
    label: { ko: '오사카', ja: '大阪', en: 'Osaka' },
    baseFare: 600, baseDistanceM: 1200,
    unitFare: 100, unitDistanceM: 231,
    timeFare: 100, timeUnitSec: 85,
    nightPctMin: 20, nightPctMax: 20, nightHours: '22:00–05:00',
    source: '大阪タクシー協会 2025-11-05 운임 개정 (osakataxi.or.jp/fare)', updated: '2026-07',
  },
  {
    id: 'JP-kyoto', country: 'JP', currency: 'JPY',
    label: { ko: '교토', ja: '京都', en: 'Kyoto' },
    baseFare: 500, baseDistanceM: 900,
    unitFare: 100, unitDistanceM: 255,
    timeFare: 100, timeUnitSec: 95, // 시간병산은 10km/h 전환 관례 환산 (공시 초 단위 미확인)
    nightPctMin: 20, nightPctMax: 20, nightHours: '22:00–05:00',
    source: '京都市域交通圏 2025-08-06 운임 개정 (近畿運輸局)', updated: '2026-07',
  },
  {
    id: 'JP-fukuoka', country: 'JP', currency: 'JPY',
    label: { ko: '후쿠오카', ja: '福岡', en: 'Fukuoka' },
    baseFare: 600, baseDistanceM: 1100,
    unitFare: 100, unitDistanceM: 287,
    timeFare: 100, timeUnitSec: 105, // 시간병산은 10km/h 전환 관례 환산
    nightPctMin: 20, nightPctMax: 20, nightHours: '22:00–05:00',
    source: '福岡交通圏 2026-07-01 운임 개정', updated: '2026-07',
  },
  {
    id: 'JP-sapporo', country: 'JP', currency: 'JPY',
    label: { ko: '삿포로', ja: '札幌', en: 'Sapporo' },
    baseFare: 600, baseDistanceM: 1050,
    unitFare: 100, unitDistanceM: 272,
    timeFare: 100, timeUnitSec: 100, // 1分40秒 공시
    nightPctMin: 20, nightPctMax: 20, nightHours: '22:00–05:00',
    source: '札幌交通圏 2025-12-17 운임 개정 (겨울철 11~3월 +20% 별도 가능)', updated: '2026-07',
  },
  {
    id: 'JP-nagoya', country: 'JP', currency: 'JPY',
    label: { ko: '나고야', ja: '名古屋', en: 'Nagoya' },
    baseFare: 500, baseDistanceM: 910,
    unitFare: 100, unitDistanceM: 232,
    timeFare: 100, timeUnitSec: 85, // 시간병산은 10km/h 전환 관례 환산
    nightPctMin: 20, nightPctMax: 20, nightHours: '22:00–05:00',
    source: '名古屋地区 2025-10-14 운임 개정 (中部運輸局)', updated: '2026-07',
  },
]

// 도심 교통 보정계수 — ORS는 교통량 미반영(제한속도 기준)이라 실주행보다 25~30% 짧게 나옴.
// 실측 비교(서울역→강남역 13분→실제 17분, 녹번역→홍대입구역 9분→실제 13분)로 1.35 캘리브레이션.
// 필요 시 도시별 세분화 가능.
export const TRAFFIC_FACTOR = 1.35
export const correctDuration = (durationSec: number) => Math.round(durationSec * TRAFFIC_FACTOR)

export const tariffById = (id: string): TaxiTariff | undefined => TAXI_TARIFFS.find((t) => t.id === id)
export const tariffsForCountry = (c: TaxiCountry) => TAXI_TARIFFS.filter((t) => t.country === c)

export interface TaxiFareResult {
  day: number
  nightMin: number
  nightMax: number
  currency: 'KRW' | 'JPY'
}

/**
 * 요금 추정. 시간거리병산(저속 가산)은 경로의 평균 속도로 저속 구간을 정확히 알 수 없으므로
 * 수학적 하한(총 소요시간 − 임계속도로 전거리 주행 시간)만 반영한다 — 임계속도는
 * 미터기가 시간 가산으로 전환되는 속도(unitDistanceM/timeUnitSec)와 동일.
 */
export function calcTaxiFare(distanceM: number, durationSec: number, t: TaxiTariff): TaxiFareResult {
  let fare = t.baseFare
  const extraM = Math.max(0, distanceM - t.baseDistanceM)
  fare += Math.ceil(extraM / t.unitDistanceM) * t.unitFare
  const vth = t.unitDistanceM / t.timeUnitSec // m/s — 시간병산 임계속도
  const slowSec = Math.max(0, durationSec - distanceM / vth)
  fare += Math.floor(slowSec / t.timeUnitSec) * t.timeFare
  return {
    day: Math.round(fare),
    nightMin: Math.round(fare * (1 + t.nightPctMin / 100)),
    nightMax: Math.round(fare * (1 + t.nightPctMax / 100)),
    currency: t.currency,
  }
}

export function formatFare(amount: number, currency: 'KRW' | 'JPY', lang: TaxiLang): string {
  const n = amount.toLocaleString(lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR')
  if (currency === 'KRW') return lang === 'ko' ? `${n}원` : `₩${n}`
  return lang === 'ja' ? `${n}円` : `¥${n}`
}
