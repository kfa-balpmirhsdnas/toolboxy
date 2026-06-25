// Supplementary per-country data (keyed by ISO-2): IANA timezone (capital),
// power plug types (IEC letters), mains voltage and frequency. Joins onto
// lib/countries.ts by code. Powers the time-difference and plug-type tools.

export interface CountryExtra { tz: string; plugs: string[]; volt: string; freq: string }

// [tz, plugs, voltage, frequency]
const D: Record<string, [string, string[], string, string]> = {
  KR: ['Asia/Seoul', ['C', 'F'], '220V', '60Hz'],
  JP: ['Asia/Tokyo', ['A', 'B'], '100V', '50/60Hz'],
  CN: ['Asia/Shanghai', ['A', 'C', 'I'], '220V', '50Hz'],
  TW: ['Asia/Taipei', ['A', 'B'], '110V', '60Hz'],
  MN: ['Asia/Ulaanbaatar', ['C', 'E'], '220V', '50Hz'],
  VN: ['Asia/Ho_Chi_Minh', ['A', 'C', 'F'], '220V', '50Hz'],
  TH: ['Asia/Bangkok', ['A', 'B', 'C', 'O'], '230V', '50Hz'],
  PH: ['Asia/Manila', ['A', 'B', 'C'], '220V', '60Hz'],
  ID: ['Asia/Jakarta', ['C', 'F'], '230V', '50Hz'],
  MY: ['Asia/Kuala_Lumpur', ['G'], '240V', '50Hz'],
  SG: ['Asia/Singapore', ['G'], '230V', '50Hz'],
  MM: ['Asia/Yangon', ['C', 'D', 'F', 'G'], '230V', '50Hz'],
  KH: ['Asia/Phnom_Penh', ['A', 'C', 'G'], '230V', '50Hz'],
  LA: ['Asia/Vientiane', ['A', 'B', 'C', 'E', 'F'], '230V', '50Hz'],
  IN: ['Asia/Kolkata', ['C', 'D', 'M'], '230V', '50Hz'],
  PK: ['Asia/Karachi', ['C', 'D'], '230V', '50Hz'],
  BD: ['Asia/Dhaka', ['C', 'D', 'G'], '220V', '50Hz'],
  LK: ['Asia/Colombo', ['D', 'G', 'M'], '230V', '50Hz'],
  NP: ['Asia/Kathmandu', ['C', 'D', 'M'], '230V', '50Hz'],
  SA: ['Asia/Riyadh', ['G'], '230V', '60Hz'],
  AE: ['Asia/Dubai', ['G'], '230V', '50Hz'],
  IL: ['Asia/Jerusalem', ['C', 'H', 'M'], '230V', '50Hz'],
  TR: ['Europe/Istanbul', ['C', 'F'], '230V', '50Hz'],
  IR: ['Asia/Tehran', ['C', 'F'], '230V', '50Hz'],
  IQ: ['Asia/Baghdad', ['C', 'D', 'G'], '230V', '50Hz'],
  QA: ['Asia/Qatar', ['G'], '240V', '50Hz'],
  GB: ['Europe/London', ['G'], '230V', '50Hz'],
  FR: ['Europe/Paris', ['C', 'E'], '230V', '50Hz'],
  DE: ['Europe/Berlin', ['C', 'F'], '230V', '50Hz'],
  IT: ['Europe/Rome', ['C', 'F', 'L'], '230V', '50Hz'],
  ES: ['Europe/Madrid', ['C', 'F'], '230V', '50Hz'],
  PT: ['Europe/Lisbon', ['C', 'F'], '230V', '50Hz'],
  NL: ['Europe/Amsterdam', ['C', 'F'], '230V', '50Hz'],
  BE: ['Europe/Brussels', ['C', 'E'], '230V', '50Hz'],
  CH: ['Europe/Zurich', ['C', 'J'], '230V', '50Hz'],
  AT: ['Europe/Vienna', ['C', 'F'], '230V', '50Hz'],
  SE: ['Europe/Stockholm', ['C', 'F'], '230V', '50Hz'],
  NO: ['Europe/Oslo', ['C', 'F'], '230V', '50Hz'],
  DK: ['Europe/Copenhagen', ['C', 'F', 'K'], '230V', '50Hz'],
  FI: ['Europe/Helsinki', ['C', 'F'], '230V', '50Hz'],
  PL: ['Europe/Warsaw', ['C', 'E'], '230V', '50Hz'],
  CZ: ['Europe/Prague', ['C', 'E'], '230V', '50Hz'],
  GR: ['Europe/Athens', ['C', 'F'], '230V', '50Hz'],
  HU: ['Europe/Budapest', ['C', 'F'], '230V', '50Hz'],
  IE: ['Europe/Dublin', ['G'], '230V', '50Hz'],
  RU: ['Europe/Moscow', ['C', 'F'], '230V', '50Hz'],
  UA: ['Europe/Kyiv', ['C', 'F'], '230V', '50Hz'],
  RO: ['Europe/Bucharest', ['C', 'F'], '230V', '50Hz'],
  US: ['America/New_York', ['A', 'B'], '120V', '60Hz'],
  CA: ['America/Toronto', ['A', 'B'], '120V', '60Hz'],
  MX: ['America/Mexico_City', ['A', 'B'], '127V', '60Hz'],
  BR: ['America/Sao_Paulo', ['C', 'N'], '127V', '60Hz'],
  AR: ['America/Argentina/Buenos_Aires', ['C', 'I'], '220V', '50Hz'],
  CL: ['America/Santiago', ['C', 'L'], '220V', '50Hz'],
  CO: ['America/Bogota', ['A', 'B'], '110V', '60Hz'],
  PE: ['America/Lima', ['A', 'B', 'C'], '220V', '60Hz'],
  EG: ['Africa/Cairo', ['C', 'F'], '220V', '50Hz'],
  ZA: ['Africa/Johannesburg', ['D', 'M', 'N'], '230V', '50Hz'],
  NG: ['Africa/Lagos', ['D', 'G'], '230V', '50Hz'],
  KE: ['Africa/Nairobi', ['G'], '240V', '50Hz'],
  ET: ['Africa/Addis_Ababa', ['C', 'F'], '220V', '50Hz'],
  MA: ['Africa/Casablanca', ['C', 'E'], '220V', '50Hz'],
  GH: ['Africa/Accra', ['D', 'G'], '230V', '50Hz'],
  TZ: ['Africa/Dar_es_Salaam', ['D', 'G'], '230V', '50Hz'],
  AU: ['Australia/Sydney', ['I'], '230V', '50Hz'],
  NZ: ['Pacific/Auckland', ['I'], '230V', '50Hz'],
  FJ: ['Pacific/Fiji', ['I'], '240V', '50Hz'],
}

export const EXTRA: Record<string, CountryExtra> = Object.fromEntries(
  Object.entries(D).map(([k, [tz, plugs, volt, freq]]) => [k, { tz, plugs, volt, freq }])
)

// current UTC offset in minutes for an IANA tz
export function tzOffsetMin(tz: string, at: Date = new Date()): number {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const p = Object.fromEntries(dtf.formatToParts(at).filter((x) => x.type !== 'literal').map((x) => [x.type, x.value]))
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour === 24 ? 0 : +p.hour, +p.minute, +p.second)
  return Math.round((asUTC - at.getTime()) / 60000)
}

export const PLUG_NAMES: Record<string, { ko: string; ja: string; en: string }> = {
  A: { ko: 'A형(북미 2핀)', ja: 'Aタイプ', en: 'Type A' }, B: { ko: 'B형(북미 3핀)', ja: 'Bタイプ', en: 'Type B' },
  C: { ko: 'C형(유럽 2핀)', ja: 'Cタイプ', en: 'Type C' }, D: { ko: 'D형(인도)', ja: 'Dタイプ', en: 'Type D' },
  E: { ko: 'E형(프랑스)', ja: 'Eタイプ', en: 'Type E' }, F: { ko: 'F형(독일/한국)', ja: 'Fタイプ', en: 'Type F' },
  G: { ko: 'G형(영국 3핀)', ja: 'Gタイプ', en: 'Type G' }, H: { ko: 'H형(이스라엘)', ja: 'Hタイプ', en: 'Type H' },
  I: { ko: 'I형(호주)', ja: 'Iタイプ', en: 'Type I' }, J: { ko: 'J형(스위스)', ja: 'Jタイプ', en: 'Type J' },
  K: { ko: 'K형(덴마크)', ja: 'Kタイプ', en: 'Type K' }, L: { ko: 'L형(이탈리아)', ja: 'Lタイプ', en: 'Type L' },
  M: { ko: 'M형(남아공)', ja: 'Mタイプ', en: 'Type M' }, N: { ko: 'N형(브라질)', ja: 'Nタイプ', en: 'Type N' },
  O: { ko: 'O형(태국)', ja: 'Oタイプ', en: 'Type O' },
}
export const plugName = (p: string, lang: string) => (PLUG_NAMES[p] ? (lang === 'ko' ? PLUG_NAMES[p].ko : lang === 'ja' ? PLUG_NAMES[p].ja : PLUG_NAMES[p].en) : p)
