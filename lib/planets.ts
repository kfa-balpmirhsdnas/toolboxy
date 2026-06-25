// Solar-system bodies with trilingual names, surface gravity (relative to Earth = 1)
// and orbital period in Earth days. Public-domain facts. Powers the planet-weight
// and planet-age tools. year = 0 means "no orbital year" (Sun, Moon) → skipped in age.

export interface Body { key: string; en: string; ko: string; ja: string; gravity: number; year: number }

export const BODIES: Body[] = [
  { key: 'sun', en: 'Sun', ko: '태양', ja: '太陽', gravity: 27.9, year: 0 },
  { key: 'mercury', en: 'Mercury', ko: '수성', ja: '水星', gravity: 0.378, year: 87.97 },
  { key: 'venus', en: 'Venus', ko: '금성', ja: '金星', gravity: 0.907, year: 224.70 },
  { key: 'earth', en: 'Earth', ko: '지구', ja: '地球', gravity: 1, year: 365.25 },
  { key: 'moon', en: 'Moon', ko: '달', ja: '月', gravity: 0.166, year: 0 },
  { key: 'mars', en: 'Mars', ko: '화성', ja: '火星', gravity: 0.377, year: 686.98 },
  { key: 'jupiter', en: 'Jupiter', ko: '목성', ja: '木星', gravity: 2.528, year: 4332.59 },
  { key: 'saturn', en: 'Saturn', ko: '토성', ja: '土星', gravity: 1.065, year: 10759.22 },
  { key: 'uranus', en: 'Uranus', ko: '천왕성', ja: '天王星', gravity: 0.886, year: 30688.5 },
  { key: 'neptune', en: 'Neptune', ko: '해왕성', ja: '海王星', gravity: 1.137, year: 60182 },
  { key: 'pluto', en: 'Pluto', ko: '명왕성', ja: '冥王星', gravity: 0.063, year: 90560 },
]

export const bodyName = (b: Body, lang: string) => (lang === 'ko' ? b.ko : lang === 'ja' ? b.ja : b.en)
