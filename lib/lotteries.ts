// Lottery rules — generated from data/lottery_rules.csv (verified 2026-06-29).
// Bonus is drawn from a SEPARATE pool when bonusCount > 0.
export type Lottery = {
  id: string
  name: { ko: string; en: string; ja: string }
  country: string
  mainMin: number; mainMax: number; mainCount: number
  bonusMin: number; bonusMax: number; bonusCount: number
}

export const LOTTERIES: Lottery[] = [
  { id: "kr_lotto645", name: { ko: "로또 6/45", en: "Lotto 6/45", ja: "ロト6/45" }, country: "KR", mainMin: 1, mainMax: 45, mainCount: 6, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "us_powerball", name: { ko: "파워볼", en: "Powerball", ja: "パワーボール" }, country: "US", mainMin: 1, mainMax: 69, mainCount: 5, bonusMin: 1, bonusMax: 26, bonusCount: 1 },
  { id: "us_megamillions", name: { ko: "메가 밀리언", en: "Mega Millions", ja: "メガ・ミリオンズ" }, country: "US", mainMin: 1, mainMax: 70, mainCount: 5, bonusMin: 1, bonusMax: 24, bonusCount: 1 },
  { id: "us_lottoamerica", name: { ko: "로또 아메리카", en: "Lotto America", ja: "ロト・アメリカ" }, country: "US", mainMin: 1, mainMax: 52, mainCount: 5, bonusMin: 1, bonusMax: 10, bonusCount: 1 },
  { id: "uk_national", name: { ko: "영국 내셔널 로터리", en: "UK National Lottery", ja: "英国ナショナルロッタリー" }, country: "UK", mainMin: 1, mainMax: 59, mainCount: 6, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "eu_euromillions", name: { ko: "유로밀리언", en: "EuroMillions", ja: "ユーロミリオンズ" }, country: "EU", mainMin: 1, mainMax: 50, mainCount: 5, bonusMin: 1, bonusMax: 12, bonusCount: 2 },
  { id: "eu_eurojackpot", name: { ko: "유로잭팟", en: "Eurojackpot", ja: "ユーロジャックポット" }, country: "EU", mainMin: 1, mainMax: 50, mainCount: 5, bonusMin: 1, bonusMax: 12, bonusCount: 2 },
  { id: "jp_loto6", name: { ko: "로토6", en: "ロト6", ja: "ロト6" }, country: "JP", mainMin: 1, mainMax: 43, mainCount: 6, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "jp_loto7", name: { ko: "로토7", en: "ロト7", ja: "ロト7" }, country: "JP", mainMin: 1, mainMax: 37, mainCount: 7, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "jp_miniloto", name: { ko: "미니로토", en: "Mini Loto", ja: "ミニロト" }, country: "JP", mainMin: 1, mainMax: 31, mainCount: 5, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "au_powerball", name: { ko: "호주 파워볼", en: "Australia Powerball", ja: "オーストラリア・パワーボール" }, country: "AU", mainMin: 1, mainMax: 35, mainCount: 7, bonusMin: 1, bonusMax: 20, bonusCount: 1 },
  { id: "ca_lottomax", name: { ko: "캐나다 로또 맥스", en: "Canada Lotto Max", ja: "カナダ・ロトマックス" }, country: "CA", mainMin: 1, mainMax: 52, mainCount: 7, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "ca_lotto649", name: { ko: "캐나다 로또 6/49", en: "Canada Lotto 6/49", ja: "カナダ・ロト6/49" }, country: "CA", mainMin: 1, mainMax: 49, mainCount: 6, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
  { id: "de_lotto", name: { ko: "독일 로또 6aus49", en: "Germany Lotto 6aus49", ja: "ドイツ・ロト6aus49" }, country: "DE", mainMin: 1, mainMax: 49, mainCount: 6, bonusMin: 0, bonusMax: 9, bonusCount: 1 },
  { id: "fr_loto", name: { ko: "프랑스 로또", en: "France Loto", ja: "フランス・ロト" }, country: "FR", mainMin: 1, mainMax: 49, mainCount: 5, bonusMin: 1, bonusMax: 10, bonusCount: 1 },
  { id: "es_primitiva", name: { ko: "스페인 라 프리미티바", en: "Spain La Primitiva", ja: "スペイン・ラ・プリミティバ" }, country: "ES", mainMin: 1, mainMax: 49, mainCount: 6, bonusMin: 0, bonusMax: 0, bonusCount: 0 },
]

// Default lottery per UI language.
export const DEFAULT_BY_LOCALE: Record<string, string> = { ko: 'kr_lotto645', en: 'us_powerball', ja: 'jp_loto6' }
