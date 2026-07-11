// 삼국지 고사성어 사전 — types, people tags, combined data + helpers.
// Data lives in threeKingdomsIdiomsData(.2).ts; adding an idiom = adding one object there.
import { IDIOMS_A } from './threeKingdomsIdiomsData'
import { IDIOMS_B } from './threeKingdomsIdiomsData2'

export type TKILang = 'ko' | 'ja' | 'en'
export type TKISrc = 'history' | 'annot' | 'novel' | 'later'
type L<T = string> = Record<TKILang, T>

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
  liubei: { hanja: '劉備', name: { ko: '유비', ja: '劉備', en: 'Liu Bei' } },
  zhugeliang: { hanja: '諸葛亮', name: { ko: '제갈량', ja: '諸葛亮', en: 'Zhuge Liang' } },
  caocao: { hanja: '曹操', name: { ko: '조조', ja: '曹操', en: 'Cao Cao' } },
  yangxiu: { hanja: '楊修', name: { ko: '양수', ja: '楊修', en: 'Yang Xiu' } },
  masu: { hanja: '馬謖', name: { ko: '마속', ja: '馬謖', en: 'Ma Su' } },
  maliang: { hanja: '馬良', name: { ko: '마량', ja: '馬良', en: 'Ma Liang' } },
  guanyu: { hanja: '關羽', name: { ko: '관우', ja: '関羽', en: 'Guan Yu' } },
  lusu: { hanja: '魯肅', name: { ko: '노숙', ja: '魯粛', en: 'Lu Su' } },
  duyu: { hanja: '杜預', name: { ko: '두예', ja: '杜預', en: 'Du Yu' } },
  zhangfei: { hanja: '張飛', name: { ko: '장비', ja: '張飛', en: 'Zhang Fei' } },
  sunquan: { hanja: '孫權', name: { ko: '손권', ja: '孫権', en: 'Sun Quan' } },
  zhangzhao: { hanja: '張昭', name: { ko: '장소', ja: '張昭', en: 'Zhang Zhao' } },
  guojia: { hanja: '郭嘉', name: { ko: '곽가', ja: '郭嘉', en: 'Guo Jia' } },
  simayi: { hanja: '司馬懿', name: { ko: '사마의', ja: '司馬懿', en: 'Sima Yi' } },
  xushao: { hanja: '許劭', name: { ko: '허소', ja: '許劭', en: 'Xu Shao' } },
  lvmeng: { hanja: '呂蒙', name: { ko: '여몽', ja: '呂蒙', en: 'Lü Meng' } },
  liushan: { hanja: '劉禪', name: { ko: '유선', ja: '劉禅', en: 'Liu Shan' } },
  simazhao: { hanja: '司馬昭', name: { ko: '사마소', ja: '司馬昭', en: 'Sima Zhao' } },
  menghuo: { hanja: '孟獲', name: { ko: '맹획', ja: '孟獲', en: 'Meng Huo' } },
  huanggai: { hanja: '黃蓋', name: { ko: '황개', ja: '黄蓋', en: 'Huang Gai' } },
  zhouyu: { hanja: '周瑜', name: { ko: '주유', ja: '周瑜', en: 'Zhou Yu' } },
  zhaoyun: { hanja: '趙雲', name: { ko: '조운', ja: '趙雲', en: 'Zhao Yun' } },
  caozhi: { hanja: '曹植', name: { ko: '조식', ja: '曹植', en: 'Cao Zhi' } },
  caopi: { hanja: '曹丕', name: { ko: '조비', ja: '曹丕', en: 'Cao Pi' } },
}

// Source badge labels + colors (정사/주석/연의/후대 구분이 이 사전의 차별화 포인트).
export const SRC_META: Record<TKISrc, { label: L; color: string }> = {
  history: { label: { ko: '정사', ja: '正史', en: 'History' }, color: '#10b981' },
  annot: { label: { ko: '정사 주석', ja: '正史注釈', en: 'Annotations' }, color: '#3b82f6' },
  novel: { label: { ko: '연의 (소설)', ja: '演義（小説）', en: 'Novel' }, color: '#f59e0b' },
  later: { label: { ko: '후대 기록', ja: '後代の記録', en: 'Later record' }, color: '#8b5cf6' },
}

export const TK_IDIOMS: TKIdiom[] = [...IDIOMS_A, ...IDIOMS_B]
export const TKI_BY_SLUG: Record<string, TKIdiom> = Object.fromEntries(TK_IDIOMS.map((i) => [i.slug, i]))

export const tkiName = (i: TKIdiom, lang: TKILang) => (lang === 'ko' ? i.ko : lang === 'ja' ? i.ja.replace(/（.*?）/g, '') : i.enLit)

// "오늘의 고사성어" — date-seeded so the pick is stable for the whole day.
export function idiomOfToday(): TKIdiom {
  const d = new Date()
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()
  return TK_IDIOMS[seed % TK_IDIOMS.length]
}
