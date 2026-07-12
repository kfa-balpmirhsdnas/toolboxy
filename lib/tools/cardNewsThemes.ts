// 카드뉴스 생성기 — 테마 정의 + 폰트 로더.
// 테마는 선언적 JSON 스키마: 렌더러(cardNewsRender.ts)가 kind 값만 해석하므로
// 이 파일에 객체를 추가하는 것만으로 새 테마가 생긴다 (코드 수정 불필요).
// 폰트는 전부 OFL/오픈 라이선스 (Pretendard, Noto Serif KR/JP, Noto Sans JP,
// 나눔손글씨 펜, 검은고딕) — 사용자 산출물의 상업 이용 안전.

export type CNLang = 'ko' | 'ja' | 'en'
export const asCNLang = (l: string): CNLang => (l === 'ja' || l === 'en' ? l : 'ko')

/* ---------------- 폰트 ---------------- */

// 역할(role) → 언어별 실제 font-family 스택. canvas ctx.font에 그대로 들어간다.
export type CNFontRole = 'sans' | 'serif' | 'hand' | 'display'

const FAMILY: Record<CNFontRole, Record<CNLang, string>> = {
  sans: { ko: 'CNPretendard, sans-serif', en: 'CNPretendard, sans-serif', ja: 'CNSansJP, CNPretendard, sans-serif' },
  serif: { ko: 'CNSerifKR, serif', en: 'CNSerifKR, serif', ja: 'CNSerifJP, CNSerifKR, serif' },
  hand: { ko: 'CNHand, CNPretendard, sans-serif', en: 'CNHand, CNPretendard, sans-serif', ja: 'CNSansJP, sans-serif' },
  display: { ko: 'CNDisplay, CNPretendard, sans-serif', en: 'CNDisplay, CNPretendard, sans-serif', ja: 'CNSansJP, sans-serif' },
}
export const familyFor = (role: CNFontRole, lang: CNLang) => FAMILY[role][lang]

// 파일 정의: family → woff2 + weight 디스크립터
const FONT_FILES: Record<string, { file: string; weight: string }[]> = {
  CNPretendard: [{ file: 'PretendardVariable.woff2', weight: '45 920' }],
  CNSerifKR: [
    { file: 'NotoSerifKR-400.woff2', weight: '400' },
    { file: 'NotoSerifKR-700.woff2', weight: '700' },
  ],
  CNSerifJP: [{ file: 'NotoSerifJP-700.woff2', weight: '700' }],
  CNSansJP: [
    { file: 'NotoSansJP-400.woff2', weight: '400' },
    { file: 'NotoSansJP-700.woff2', weight: '700' },
  ],
  CNHand: [{ file: 'NanumPenScript-400.woff2', weight: '400' }],
  CNDisplay: [{ file: 'BlackHanSans-400.woff2', weight: '400' }],
}

const loaded = new Set<string>()
async function loadFamily(fam: string) {
  if (loaded.has(fam) || typeof document === 'undefined') return
  loaded.add(fam)
  const defs = FONT_FILES[fam]
  if (!defs) return
  await Promise.all(defs.map(async (d) => {
    const f = new FontFace(fam, `url(/fonts/${d.file}) format('woff2')`, { weight: d.weight })
    await f.load()
    document.fonts.add(f)
  }))
}

// 테마가 쓰는 폰트만 지연 로드. 렌더 전 반드시 await — 폰트 미적용 내보내기 방지.
export async function ensureThemeFonts(theme: CNTheme, lang: CNLang): Promise<void> {
  const fams = new Set<string>()
  for (const role of [theme.font.head, theme.font.body]) {
    for (const f of FAMILY[role][lang].split(',')) {
      const name = f.trim()
      if (FONT_FILES[name]) fams.add(name)
    }
  }
  await Promise.all(Array.from(fams).map(loadFamily))
  await document.fonts.ready
}

/* ---------------- 테마 스키마 ---------------- */

export type CNBg =
  | { kind: 'solid'; c: string }
  | { kind: 'gradient'; from: string; to: string }
  | { kind: 'notebook'; paper: string; line: string; margin: string }
  | { kind: 'blocks'; colors: string[] } // 페이지마다 순환하는 단색 블록

export type CNEm =
  | { kind: 'color'; c: string }
  | { kind: 'highlight'; c: string } // 형광펜 (글자 뒤 박스)
  | { kind: 'underline'; c: string }
  | { kind: 'invert'; c: string; textC: string } // 반전 블록

export interface CNTheme {
  id: string
  font: { head: CNFontRole; body: CNFontRole }
  headWeight: number
  bodyWeight: number
  bg: CNBg
  fg: string // 본문 텍스트
  headC?: string // 제목 색 (없으면 fg)
  sub: string // 보조 텍스트 (소제목 라벨·페이지 번호 등)
  accent: string
  em: CNEm
  cover: {
    align: 'center' | 'left'
    bar?: boolean // 제목 위 포인트 바
    rule?: 'double' | 'single' // 신문 마스트헤드 괘선
    overline?: boolean // 제목 위 작은 라벨(계정명/브랜드 위치)
    ghost?: boolean // 초대형 유령 숫자(흑백 타이포)
    tape?: boolean // 마스킹 테이프(노트)
  }
  bodyAlign: 'left' | 'center'
  dots: { shape: 'circle' | 'square' | 'dash'; c: string; active: string }
  onDark?: boolean // 어두운 배경 (스와치 텍스트 대비용)
}

export const CN_THEMES: CNTheme[] = [
  { id: 'minimal', font: { head: 'sans', body: 'sans' }, headWeight: 800, bodyWeight: 500,
    bg: { kind: 'solid', c: '#ffffff' }, fg: '#1f2328', sub: '#9aa1ab', accent: '#1f2328',
    em: { kind: 'underline', c: '#1f2328' },
    cover: { align: 'center', overline: true }, bodyAlign: 'center',
    dots: { shape: 'circle', c: '#e2e5ea', active: '#1f2328' } },

  { id: 'dark', font: { head: 'sans', body: 'sans' }, headWeight: 800, bodyWeight: 400,
    bg: { kind: 'solid', c: '#101318' }, fg: '#e8ecf3', sub: '#7d8695', accent: '#3b82f6',
    em: { kind: 'color', c: '#60a5fa' },
    cover: { align: 'left', bar: true }, bodyAlign: 'left',
    dots: { shape: 'circle', c: '#2a3140', active: '#3b82f6' }, onDark: true },

  { id: 'pastel', font: { head: 'sans', body: 'sans' }, headWeight: 800, bodyWeight: 500,
    bg: { kind: 'gradient', from: '#d9c8f5', to: '#ffd9c9' }, fg: '#4b3560', sub: '#8a76a0', accent: '#ffffff',
    em: { kind: 'highlight', c: 'rgba(255,255,255,0.6)' },
    cover: { align: 'center' }, bodyAlign: 'center',
    dots: { shape: 'circle', c: 'rgba(255,255,255,0.5)', active: '#ffffff' } },

  { id: 'newspaper', font: { head: 'serif', body: 'serif' }, headWeight: 700, bodyWeight: 400,
    bg: { kind: 'solid', c: '#faf6ec' }, fg: '#2b2417', sub: '#8c8064', accent: '#2b2417',
    em: { kind: 'underline', c: '#2b2417' },
    cover: { align: 'left', rule: 'double', overline: true }, bodyAlign: 'left',
    dots: { shape: 'dash', c: '#d8d0bc', active: '#2b2417' } },

  { id: 'highlight', font: { head: 'sans', body: 'sans' }, headWeight: 800, bodyWeight: 600,
    bg: { kind: 'solid', c: '#ffffff' }, fg: '#17181a', sub: '#9aa1ab', accent: '#ffd600',
    em: { kind: 'highlight', c: '#fff176' },
    cover: { align: 'left' }, bodyAlign: 'left',
    dots: { shape: 'square', c: '#ececec', active: '#17181a' } },

  { id: 'note', font: { head: 'hand', body: 'hand' }, headWeight: 400, bodyWeight: 400,
    bg: { kind: 'notebook', paper: '#fbfaf4', line: '#dbe4f0', margin: '#f0b9b9' }, fg: '#3d4a5c', sub: '#9aa5b5', accent: '#d94f4f',
    em: { kind: 'color', c: '#d94f4f' },
    cover: { align: 'center', tape: true }, bodyAlign: 'left',
    dots: { shape: 'circle', c: '#dbe4f0', active: '#3d4a5c' } },

  { id: 'navy', font: { head: 'serif', body: 'sans' }, headWeight: 700, bodyWeight: 400,
    bg: { kind: 'solid', c: '#152f5a' }, fg: '#eef0f5', headC: '#d3b478', sub: '#94a3c4', accent: '#d3b478',
    em: { kind: 'color', c: '#d3b478' },
    cover: { align: 'center', rule: 'single', overline: true }, bodyAlign: 'center',
    dots: { shape: 'square', c: '#2c4a80', active: '#d3b478' }, onDark: true },

  { id: 'beige', font: { head: 'sans', body: 'sans' }, headWeight: 700, bodyWeight: 500,
    bg: { kind: 'solid', c: '#f2e9da' }, fg: '#5b4636', sub: '#a68f77', accent: '#c05f33',
    em: { kind: 'color', c: '#c05f33' },
    cover: { align: 'center' }, bodyAlign: 'center',
    dots: { shape: 'circle', c: '#dccbb4', active: '#5b4636' } },

  { id: 'pop', font: { head: 'sans', body: 'sans' }, headWeight: 900, bodyWeight: 600,
    bg: { kind: 'blocks', colors: ['#ff5a5f', '#2e6ef2', '#00a878', '#ffb400'] }, fg: '#ffffff', sub: 'rgba(255,255,255,0.75)', accent: '#ffffff',
    em: { kind: 'invert', c: '#ffffff', textC: '#17181a' },
    cover: { align: 'left' }, bodyAlign: 'left',
    dots: { shape: 'circle', c: 'rgba(255,255,255,0.4)', active: '#ffffff' }, onDark: true },

  { id: 'mono', font: { head: 'display', body: 'sans' }, headWeight: 400, bodyWeight: 500,
    bg: { kind: 'solid', c: '#ffffff' }, fg: '#000000', sub: '#b5b5b5', accent: '#000000',
    em: { kind: 'invert', c: '#000000', textC: '#ffffff' },
    cover: { align: 'left', ghost: true }, bodyAlign: 'left',
    dots: { shape: 'square', c: '#e5e5e5', active: '#000000' } },
]

export const themeById = (id: string): CNTheme => CN_THEMES.find((t) => t.id === id) || CN_THEMES[0]
