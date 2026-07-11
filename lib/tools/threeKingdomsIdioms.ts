// 삼국지 고사성어 사전 — types, people tags, combined data + helpers.
// Data lives in threeKingdomsIdiomsData(.2).ts; adding an idiom = adding one object there.
import { IDIOMS_A } from './threeKingdomsIdiomsData'
import { IDIOMS_B } from './threeKingdomsIdiomsData2'
import { SRC_META as COMMON_SRC_META, type TKLang, type TKSrc, type TKL } from './tkCommon'

export type TKILang = TKLang
export type TKISrc = TKSrc
type L<T = string> = TKL<T>

export interface TKIdiom {
  slug: string
  hanja: string
  ko: string        // Korean reading
  ja: string        // Japanese form (with kana reading)
  pinyin: string
  enLit: string     // English literal rendering
  src: TKISrc       // 정사 / 정사(주석) / 연의 / 후대
  srcName: L        // source title per language
  people: string[]  // person ids (PEOPLE)
  meaning: L
  story: L
  ex: [L, L]
  rel: string[]     // 3 related idiom slugs
}

// Person tags — id → localized display name (+ hanja for badges).
export const PEOPLE: Record<string, { hanja: string; name: L }> = {
  'liu-bei': { hanja: '劉備', name: { ko: '유비', ja: '劉備', en: 'Liu Bei' } },
  'zhuge-liang': { hanja: '諸葛亮', name: { ko: '제갈량', ja: '諸葛亮', en: 'Zhuge Liang' } },
  'cao-cao': { hanja: '曹操', name: { ko: '조조', ja: '曹操', en: 'Cao Cao' } },
  'yang-xiu': { hanja: '楊修', name: { ko: '양수', ja: '楊修', en: 'Yang Xiu' } },
  'ma-su': { hanja: '馬謖', name: { ko: '마속', ja: '馬謖', en: 'Ma Su' } },
  'ma-liang': { hanja: '馬良', name: { ko: '마량', ja: '馬良', en: 'Ma Liang' } },
  'guan-yu': { hanja: '關羽', name: { ko: '관우', ja: '関羽', en: 'Guan Yu' } },
  'lu-su': { hanja: '魯肅', name: { ko: '노숙', ja: '魯粛', en: 'Lu Su' } },
  'du-yu': { hanja: '杜預', name: { ko: '두예', ja: '杜預', en: 'Du Yu' } },
  'zhang-fei': { hanja: '張飛', name: { ko: '장비', ja: '張飛', en: 'Zhang Fei' } },
  'sun-quan': { hanja: '孫權', name: { ko: '손권', ja: '孫権', en: 'Sun Quan' } },
  'zhang-zhao': { hanja: '張昭', name: { ko: '장소', ja: '張昭', en: 'Zhang Zhao' } },
  'guo-jia': { hanja: '郭嘉', name: { ko: '곽가', ja: '郭嘉', en: 'Guo Jia' } },
  'sima-yi': { hanja: '司馬懿', name: { ko: '사마의', ja: '司馬懿', en: 'Sima Yi' } },
  'xu-shao': { hanja: '許劭', name: { ko: '허소', ja: '許劭', en: 'Xu Shao' } },
  'lv-meng': { hanja: '呂蒙', name: { ko: '여몽', ja: '呂蒙', en: 'Lü Meng' } },
  'liu-shan': { hanja: '劉禪', name: { ko: '유선', ja: '劉禅', en: 'Liu Shan' } },
  'sima-zhao': { hanja: '司馬昭', name: { ko: '사마소', ja: '司馬昭', en: 'Sima Zhao' } },
  'meng-huo': { hanja: '孟獲', name: { ko: '맹획', ja: '孟獲', en: 'Meng Huo' } },
  'huang-gai': { hanja: '黃蓋', name: { ko: '황개', ja: '黄蓋', en: 'Huang Gai' } },
  'zhou-yu': { hanja: '周瑜', name: { ko: '주유', ja: '周瑜', en: 'Zhou Yu' } },
  'zhao-yun': { hanja: '趙雲', name: { ko: '조운', ja: '趙雲', en: 'Zhao Yun' } },
  'cao-zhi': { hanja: '曹植', name: { ko: '조식', ja: '曹植', en: 'Cao Zhi' } },
  'cao-pi': { hanja: '曹丕', name: { ko: '조비', ja: '曹丕', en: 'Cao Pi' } },
}

// Source badge labels + colors (정사/주석/연의/후대 구분이 이 사전의 차별화 포인트).
export const SRC_META = COMMON_SRC_META

export const TK_IDIOMS: TKIdiom[] = [...IDIOMS_A, ...IDIOMS_B]
export const TKI_BY_SLUG: Record<string, TKIdiom> = Object.fromEntries(TK_IDIOMS.map((i) => [i.slug, i]))

export const tkiName = (i: TKIdiom, lang: TKILang) => (lang === 'ko' ? i.ko : lang === 'ja' ? i.ja.replace(/（.*?）/g, '') : i.enLit)

// "오늘의 고사성어" — date-seeded so the pick is stable for the whole day.
export function idiomOfToday(): TKIdiom {
  const d = new Date()
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()
  return TK_IDIOMS[seed % TK_IDIOMS.length]
}
