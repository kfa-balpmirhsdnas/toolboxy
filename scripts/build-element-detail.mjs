// Fills the empty columns of periodic_table_elements.csv (electron_config,
// melting_c, boiling_c, discovery_year) + adds use_en/use_ja, and generates
// lib/elements-detail.ts for the periodic-table card. Numeric data are standard
// reference values (Pauling electronegativity, melting/boiling in °C, ground-state
// configurations, discovery/synthesis years). Superheavy elements (104+) and other
// genuinely unknown values are left blank rather than asserting predicted numbers.
// Run: node scripts/build-element-detail.mjs
import fs from 'fs'

// D[n] = [electron_config, melting_c, boiling_c, discovery_year, use_en, use_ja]
// melting/boiling: number °C or null (unknown). year: number or null (= since antiquity).
const D = {
  1: ['1s1', -259, -253, 1766, 'Fuel cells, ammonia synthesis', '燃料電池・アンモニア合成'],
  2: ['1s2', null, -269, 1868, 'Balloons, cryogenic cooling, MRI', '風船・極低温冷却・MRI'],
  3: ['[He] 2s1', 181, 1342, 1817, 'Lithium-ion batteries', 'リチウムイオン電池'],
  4: ['[He] 2s2', 1287, 2469, 1798, 'Aerospace alloys, X-ray windows', '航空宇宙合金・X線窓'],
  5: ['[He] 2s2 2p1', 2076, 3927, 1808, 'Glass, semiconductors, detergents', 'ガラス・半導体・洗剤'],
  6: ['[He] 2s2 2p2', 3550, 4827, null, 'Steel, plastics, life (organic matter)', '鋼・プラスチック・生命の素'],
  7: ['[He] 2s2 2p3', -210, -196, 1772, 'Fertilizers, inert atmosphere', '肥料・不活性ガス'],
  8: ['[He] 2s2 2p4', -218, -183, 1774, 'Respiration, steelmaking, welding', '呼吸・製鋼・溶接'],
  9: ['[He] 2s2 2p5', -220, -188, 1886, 'Toothpaste, Teflon, refrigerants', '歯磨き・テフロン・冷媒'],
  10: ['[He] 2s2 2p6', -249, -246, 1898, 'Neon signs, lasers', 'ネオンサイン・レーザー'],
  11: ['[Ne] 3s1', 98, 883, 1807, 'Table salt, street lamps', '食塩・街灯'],
  12: ['[Ne] 3s2', 650, 1090, 1755, 'Lightweight alloys, fireworks', '軽量合金・花火'],
  13: ['[Ne] 3s2 3p1', 660, 2519, 1825, 'Cans, foil, aircraft, wiring', '缶・ホイル・航空機・配線'],
  14: ['[Ne] 3s2 3p2', 1414, 3265, 1824, 'Semiconductors, glass, solar cells', '半導体・ガラス・太陽電池'],
  15: ['[Ne] 3s2 3p3', 44, 281, 1669, 'Fertilizers, matches, DNA', '肥料・マッチ・DNA'],
  16: ['[Ne] 3s2 3p4', 115, 445, null, 'Sulfuric acid, vulcanizing rubber', '硫酸・ゴム加硫'],
  17: ['[Ne] 3s2 3p5', -102, -34, 1774, 'Disinfectant, PVC, bleach', '消毒・PVC・漂白'],
  18: ['[Ne] 3s2 3p6', -189, -186, 1894, 'Welding shield, light bulbs', '溶接シールド・電球'],
  19: ['[Ar] 4s1', 63, 759, 1807, 'Fertilizers, body electrolytes', '肥料・体内電解質'],
  20: ['[Ar] 4s2', 842, 1484, 1808, 'Cement, bones, dietary supplement', 'セメント・骨・栄養補助'],
  21: ['[Ar] 3d1 4s2', 1541, 2836, 1879, 'Aerospace, sports equipment alloys', '航空宇宙・スポーツ用合金'],
  22: ['[Ar] 3d2 4s2', 1668, 3287, 1791, 'Aircraft, implants, white pigment', '航空機・インプラント・白色顔料'],
  23: ['[Ar] 3d3 4s2', 1910, 3407, 1801, 'Steel hardening, catalysts', '鋼の強化・触媒'],
  24: ['[Ar] 3d5 4s1', 1907, 2671, 1797, 'Stainless steel, chrome plating', 'ステンレス・クロムめっき'],
  25: ['[Ar] 3d5 4s2', 1246, 2061, 1774, 'Steel, batteries, alloys', '鋼・電池・合金'],
  26: ['[Ar] 3d6 4s2', 1538, 2861, null, 'Steel, construction, hemoglobin', '鋼・建設・ヘモグロビン'],
  27: ['[Ar] 3d7 4s2', 1495, 2927, 1735, 'Magnets, batteries, blue pigment', '磁石・電池・青色顔料'],
  28: ['[Ar] 3d8 4s2', 1455, 2913, 1751, 'Stainless steel, coins, plating', 'ステンレス・硬貨・めっき'],
  29: ['[Ar] 3d10 4s1', 1085, 2562, null, 'Wiring, plumbing, electronics', '配線・配管・電子機器'],
  30: ['[Ar] 3d10 4s2', 420, 907, 1746, 'Galvanizing, brass, supplements', 'めっき・真鍮・栄養補助'],
  31: ['[Ar] 3d10 4s2 4p1', 30, 2204, 1875, 'LEDs, semiconductors', 'LED・半導体'],
  32: ['[Ar] 3d10 4s2 4p2', 938, 2833, 1886, 'Fiber optics, infrared optics', '光ファイバー・赤外線光学'],
  33: ['[Ar] 3d10 4s2 4p3', 817, 615, 1250, 'Semiconductors, wood preservative', '半導体・木材防腐剤'],
  34: ['[Ar] 3d10 4s2 4p4', 221, 685, 1817, 'Photocells, glass tinting', '光電池・ガラス着色'],
  35: ['[Ar] 3d10 4s2 4p5', -7, 59, 1826, 'Flame retardants, disinfectants', '難燃剤・消毒剤'],
  36: ['[Ar] 3d10 4s2 4p6', -157, -153, 1898, 'Lighting, high-speed lamps', '照明・高速ランプ'],
  37: ['[Kr] 5s1', 39, 688, 1861, 'Atomic clocks, research', '原子時計・研究'],
  38: ['[Kr] 5s2', 777, 1382, 1790, 'Red fireworks, glass', '赤色花火・ガラス'],
  39: ['[Kr] 4d1 5s2', 1526, 3336, 1794, 'LED phosphors, superconductors', 'LED蛍光体・超伝導体'],
  40: ['[Kr] 4d2 5s2', 1855, 4409, 1789, 'Nuclear reactors, ceramics', '原子炉・セラミックス'],
  41: ['[Kr] 4d4 5s1', 2477, 4744, 1801, 'Superconducting magnets, steel', '超伝導磁石・鋼'],
  42: ['[Kr] 4d5 5s1', 2623, 4639, 1781, 'High-strength steel, catalysts', '高強度鋼・触媒'],
  43: ['[Kr] 4d5 5s2', 2157, 4265, 1937, 'Medical imaging tracers', '医療画像トレーサー'],
  44: ['[Kr] 4d7 5s1', 2334, 4150, 1844, 'Electrical contacts, catalysts', '電気接点・触媒'],
  45: ['[Kr] 4d8 5s1', 1964, 3695, 1803, 'Catalytic converters, jewelry', '触媒コンバーター・宝飾'],
  46: ['[Kr] 4d10', 1555, 2963, 1803, 'Catalytic converters, electronics', '触媒コンバーター・電子機器'],
  47: ['[Kr] 4d10 5s1', 962, 2162, null, 'Jewelry, electronics, mirrors', '宝飾・電子機器・鏡'],
  48: ['[Kr] 4d10 5s2', 321, 767, 1817, 'Batteries, pigments, plating', '電池・顔料・めっき'],
  49: ['[Kr] 4d10 5s2 5p1', 157, 2072, 1863, 'Touchscreens (ITO), solders', 'タッチパネル(ITO)・はんだ'],
  50: ['[Kr] 4d10 5s2 5p2', 232, 2602, null, 'Solder, tin plating, bronze', 'はんだ・ブリキ・青銅'],
  51: ['[Kr] 4d10 5s2 5p3', 631, 1587, null, 'Flame retardants, alloys', '難燃剤・合金'],
  52: ['[Kr] 4d10 5s2 5p4', 450, 988, 1782, 'Solar panels, alloys', '太陽電池・合金'],
  53: ['[Kr] 4d10 5s2 5p5', 114, 184, 1811, 'Disinfectant, thyroid health', '消毒・甲状腺の健康'],
  54: ['[Kr] 4d10 5s2 5p6', -112, -108, 1898, 'Lamps, ion thrusters, anesthesia', 'ランプ・イオンエンジン・麻酔'],
  55: ['[Xe] 6s1', 28, 671, 1860, 'Atomic clocks, drilling fluids', '原子時計・掘削流体'],
  56: ['[Xe] 6s2', 727, 1845, 1808, 'X-ray contrast, drilling fluids', 'X線造影剤・掘削流体'],
  57: ['[Xe] 5d1 6s2', 920, 3464, 1839, 'Camera lenses, lighter flints', 'カメラレンズ・ライター石'],
  58: ['[Xe] 4f1 5d1 6s2', 795, 3443, 1803, 'Catalytic converters, polishing', '触媒コンバーター・研磨'],
  59: ['[Xe] 4f3 6s2', 935, 3520, 1885, 'Strong magnets, glass coloring', '強力磁石・ガラス着色'],
  60: ['[Xe] 4f4 6s2', 1024, 3074, 1885, 'Powerful magnets (NdFeB), lasers', '強力磁石(NdFeB)・レーザー'],
  61: ['[Xe] 4f5 6s2', 1042, 3000, 1945, 'Luminous paint, research', '夜光塗料・研究'],
  62: ['[Xe] 4f6 6s2', 1072, 1794, 1879, 'Magnets, cancer treatment', '磁石・がん治療'],
  63: ['[Xe] 4f7 6s2', 822, 1529, 1901, 'Red/blue phosphors, anti-counterfeit', '赤・青蛍光体・偽造防止'],
  64: ['[Xe] 4f7 5d1 6s2', 1313, 3273, 1880, 'MRI contrast, neutron shielding', 'MRI造影剤・中性子遮蔽'],
  65: ['[Xe] 4f9 6s2', 1356, 3230, 1843, 'Green phosphors, solid-state devices', '緑色蛍光体・固体素子'],
  66: ['[Xe] 4f10 6s2', 1412, 2567, 1886, 'Magnets, data storage, lasers', '磁石・データ記録・レーザー'],
  67: ['[Xe] 4f11 6s2', 1474, 2700, 1878, 'High-power magnets, lasers', '高出力磁石・レーザー'],
  68: ['[Xe] 4f12 6s2', 1529, 2868, 1843, 'Fiber-optic amplifiers, pink glass', '光ファイバー増幅・ピンクガラス'],
  69: ['[Xe] 4f13 6s2', 1545, 1950, 1879, 'Portable X-ray sources', '携帯X線源'],
  70: ['[Xe] 4f14 6s2', 819, 1196, 1878, 'Lasers, stress gauges', 'レーザー・応力計'],
  71: ['[Xe] 4f14 5d1 6s2', 1663, 3402, 1907, 'Petroleum cracking catalyst, PET scans', '石油分解触媒・PET検査'],
  72: ['[Xe] 4f14 5d2 6s2', 2233, 4603, 1923, 'Nuclear control rods, alloys', '原子炉制御棒・合金'],
  73: ['[Xe] 4f14 5d3 6s2', 3017, 5458, 1802, 'Capacitors, surgical implants', 'コンデンサ・外科インプラント'],
  74: ['[Xe] 4f14 5d4 6s2', 3422, 5555, 1783, 'Light-bulb filaments, drills, alloys', '電球フィラメント・ドリル・合金'],
  75: ['[Xe] 4f14 5d5 6s2', 3186, 5596, 1925, 'Jet engine alloys, catalysts', 'ジェットエンジン合金・触媒'],
  76: ['[Xe] 4f14 5d6 6s2', 3033, 5012, 1803, 'Hard alloys, fountain-pen tips', '硬質合金・万年筆ペン先'],
  77: ['[Xe] 4f14 5d7 6s2', 2446, 4428, 1803, 'Spark plugs, crucibles', '点火プラグ・るつぼ'],
  78: ['[Xe] 4f14 5d9 6s1', 1768, 3825, 1735, 'Catalytic converters, jewelry', '触媒コンバーター・宝飾'],
  79: ['[Xe] 4f14 5d10 6s1', 1064, 2856, null, 'Jewelry, electronics, currency', '宝飾・電子機器・通貨'],
  80: ['[Xe] 4f14 5d10 6s2', -39, 357, null, 'Thermometers, lamps (historic)', '体温計・ランプ(歴史的)'],
  81: ['[Xe] 4f14 5d10 6s2 6p1', 304, 1473, 1861, 'Electronics, infrared detectors', '電子機器・赤外線検出器'],
  82: ['[Xe] 4f14 5d10 6s2 6p2', 327, 1749, null, 'Batteries, radiation shielding', '電池・放射線遮蔽'],
  83: ['[Xe] 4f14 5d10 6s2 6p3', 271, 1564, 1753, 'Pepto-Bismol, low-melt alloys', '胃腸薬・低融点合金'],
  84: ['[Xe] 4f14 5d10 6s2 6p4', 254, 962, 1898, 'Static eliminators, research', '静電除去・研究'],
  85: ['[Xe] 4f14 5d10 6s2 6p5', 302, 337, 1940, 'Cancer research (radiotherapy)', 'がん研究(放射線治療)'],
  86: ['[Xe] 4f14 5d10 6s2 6p6', -71, -62, 1900, 'Radiation therapy, geology tracer', '放射線治療・地質トレーサー'],
  87: ['[Rn] 7s1', 27, 677, 1939, 'Research only', '研究用のみ'],
  88: ['[Rn] 7s2', 700, 1737, 1898, 'Cancer therapy (historic), research', 'がん治療(歴史的)・研究'],
  89: ['[Rn] 6d1 7s2', 1050, 3200, 1899, 'Neutron sources, research', '中性子源・研究'],
  90: ['[Rn] 6d2 7s2', 1750, 4788, 1829, 'Nuclear fuel, gas mantles', '核燃料・ガスマントル'],
  91: ['[Rn] 5f2 6d1 7s2', 1568, 4027, 1913, 'Research only', '研究用のみ'],
  92: ['[Rn] 5f3 6d1 7s2', 1132, 4131, 1789, 'Nuclear fuel and weapons', '核燃料・核兵器'],
  93: ['[Rn] 5f4 6d1 7s2', 644, 3902, 1940, 'Neutron detectors, research', '中性子検出器・研究'],
  94: ['[Rn] 5f6 7s2', 640, 3228, 1940, 'Nuclear weapons, spacecraft power', '核兵器・宇宙機電源'],
  95: ['[Rn] 5f7 7s2', 1176, 2011, 1944, 'Smoke detectors', '煙感知器'],
  96: ['[Rn] 5f7 6d1 7s2', 1345, 3110, 1944, 'Spacecraft power, research', '宇宙機電源・研究'],
  97: ['[Rn] 5f9 7s2', 986, 2627, 1949, 'Research only', '研究用のみ'],
  98: ['[Rn] 5f10 7s2', 900, 1470, 1950, 'Neutron source for oil wells', '油井用中性子源'],
  99: ['[Rn] 5f11 7s2', null, null, 1952, 'Research only', '研究用のみ'],
  100: ['[Rn] 5f12 7s2', null, null, 1953, 'Research only', '研究用のみ'],
  101: ['[Rn] 5f13 7s2', null, null, 1955, 'Research only', '研究用のみ'],
  102: ['[Rn] 5f14 7s2', null, null, 1966, 'Research only', '研究用のみ'],
  103: ['[Rn] 5f14 7s2 7p1', null, null, 1961, 'Research only', '研究用のみ'],
  104: ['[Rn] 5f14 6d2 7s2', null, null, 1964, 'Research only (superheavy)', '研究用(超重元素)'],
  105: ['[Rn] 5f14 6d3 7s2', null, null, 1967, 'Research only (superheavy)', '研究用(超重元素)'],
  106: ['[Rn] 5f14 6d4 7s2', null, null, 1974, 'Research only (superheavy)', '研究用(超重元素)'],
  107: ['[Rn] 5f14 6d5 7s2', null, null, 1981, 'Research only (superheavy)', '研究用(超重元素)'],
  108: ['[Rn] 5f14 6d6 7s2', null, null, 1984, 'Research only (superheavy)', '研究用(超重元素)'],
  109: ['[Rn] 5f14 6d7 7s2', null, null, 1982, 'Research only (superheavy)', '研究用(超重元素)'],
  110: ['[Rn] 5f14 6d8 7s2', null, null, 1994, 'Research only (superheavy)', '研究用(超重元素)'],
  111: ['[Rn] 5f14 6d9 7s2', null, null, 1994, 'Research only (superheavy)', '研究用(超重元素)'],
  112: ['[Rn] 5f14 6d10 7s2', null, null, 1996, 'Research only (superheavy)', '研究用(超重元素)'],
  113: ['[Rn] 5f14 6d10 7s2 7p1', null, null, 2004, 'Research only (superheavy)', '研究用(超重元素)'],
  114: ['[Rn] 5f14 6d10 7s2 7p2', null, null, 1998, 'Research only (superheavy)', '研究用(超重元素)'],
  115: ['[Rn] 5f14 6d10 7s2 7p3', null, null, 2003, 'Research only (superheavy)', '研究用(超重元素)'],
  116: ['[Rn] 5f14 6d10 7s2 7p4', null, null, 2000, 'Research only (superheavy)', '研究用(超重元素)'],
  117: ['[Rn] 5f14 6d10 7s2 7p5', null, null, 2010, 'Research only (superheavy)', '研究用(超重元素)'],
  118: ['[Rn] 5f14 6d10 7s2 7p6', null, null, 2002, 'Research only (superheavy)', '研究用(超重元素)'],
}
// Predicted (not experimentally confirmed) ground-state configurations.
const CONFIG_ESTIMATED = new Set([104,105,106,107,108,109,110,111,112,113,114,115,116,117,118])

// --- CSV parse (quoted fields may contain commas, e.g. electron_shells) ---
function parseCsvLine(line) {
  const out = []; let cur = ''; let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur); return out
}
const csvCell = (v) => (v == null || v === '') ? '' : (/[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v))

const raw = fs.readFileSync('periodic_table_elements.csv', 'utf8').replace(/^﻿/, '')
const lines = raw.split(/\r?\n/).filter((l) => l.trim().length)
const header = parseCsvLine(lines[0])
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]))

// state_room (Korean) -> code + estimated flag
function stateCode(s) {
  const est = s.includes('추정')
  let code = 'unknown'
  if (s.includes('기체')) code = 'gas'
  else if (s.includes('액체')) code = 'liquid'
  else if (s.includes('고체')) code = 'solid'
  return { code, est }
}

const rows = lines.slice(1).map(parseCsvLine)
const detail = {}
const outRows = []
for (const r of rows) {
  const n = Number(r[idx.atomic_number])
  const d = D[n] || [null, null, null, null, '', '']
  const [config, mp, bp, yr, ue, uj] = d
  const st = stateCode(r[idx.state_room] || '')
  const enegRaw = r[idx.electronegativity]
  const eneg = enegRaw === '' || enegRaw == null ? null : Number(enegRaw)

  detail[n] = {
    config: config || '',
    configEstimated: CONFIG_ESTIMATED.has(n),
    shells: r[idx.electron_shells] || '',
    state: st.code,
    stateEstimated: st.est,
    melt: mp,
    boil: bp,
    eneg,
    year: yr,
    useKo: r[idx.use_ko] || '',
    useEn: ue || '',
    useJa: uj || '',
  }

  // rebuild CSV row with filled columns
  const row = { ...Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ''])) }
  row.electron_config = config || ''
  row.melting_c = mp == null ? '' : mp
  row.boiling_c = bp == null ? '' : bp
  row.discovery_year = yr == null ? '' : yr
  row.use_en = ue || ''
  row.use_ja = uj || ''
  outRows.push(row)
}

// write CSV (existing header order + appended use_en/use_ja if missing)
const outHeader = [...header.map((h) => h.trim())]
for (const extra of ['use_en', 'use_ja']) if (!outHeader.includes(extra)) outHeader.push(extra)
const csvOut = '﻿' + [outHeader.join(','), ...outRows.map((row) => outHeader.map((h) => csvCell(row[h])).join(','))].join('\n') + '\n'
fs.writeFileSync('periodic_table_elements.csv', csvOut)

// write lib/elements-detail.ts
const ts = `// Generated by scripts/build-element-detail.mjs from periodic_table_elements.csv.
// Extra per-element facts for the periodic-table card. Numeric values are standard
// reference data (melting/boiling in °C, Pauling electronegativity, ground-state
// configuration, discovery/synthesis year). null = unknown/not applicable; for an
// element known since antiquity \`year\` is null (rendered as "ancient"). Superheavy
// configurations (configEstimated) are predicted. DO NOT EDIT BY HAND — edit the
// script's data table and re-run.
export interface ElementDetail {
  config: string
  configEstimated: boolean
  shells: string
  state: 'solid' | 'liquid' | 'gas' | 'unknown'
  stateEstimated: boolean
  melt: number | null
  boil: number | null
  eneg: number | null
  year: number | null
  useKo: string
  useEn: string
  useJa: string
}

export const ELEMENT_DETAIL: Record<number, ElementDetail> = ${JSON.stringify(detail, null, 2)}
`
fs.writeFileSync('lib/elements-detail.ts', ts)
console.log(`done: ${Object.keys(detail).length} elements -> CSV + lib/elements-detail.ts`)
