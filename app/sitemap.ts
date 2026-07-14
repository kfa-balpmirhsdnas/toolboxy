import type { MetadataRoute } from 'next'
import { TOOLS, CATEGORY_META, HIDDEN_CATEGORIES, isHiddenTool, type ToolCategory } from '@/lib/tools/registry'
import { GLOBAL_TOOLS } from '@/lib/tools/metadata'
import { IDIOMS } from '@/lib/gosaseongeo'
import { TK_IDIOMS } from '@/lib/tools/threeKingdomsIdioms'
import { TK_CHARS } from '@/lib/tools/threeKingdomsCharacters'
import { TK_QUOTES } from '@/lib/tools/threeKingdomsQuotes'
import { TK_BATTLES } from '@/lib/tools/threeKingdomsBattles'
import { ELEMENTS, elementSlug } from '@/lib/elements'
import { COUNTRIES, countrySlug } from '@/lib/countries'
import { CSS_COLORS, colorSlug } from '@/lib/color-names'
import { HANJA_LIST } from '@/lib/classics/hanja-index'
import { SAJASOHAK } from '@/lib/classics/sajasohak'
import { ZODIAC_SIGNS, ZODIAC_ANIMALS } from '@/lib/zodiac'

const BASE_URL = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko']
const now = new Date()

// Only categories that actually have tools (avoid thin/empty pages).
const NONEMPTY_CATEGORIES = (Object.keys(CATEGORY_META) as ToolCategory[]).filter(
  (cat) => !HIDDEN_CATEGORIES.has(cat) && TOOLS.some((t) => t.category === cat || t.also?.includes(cat)),
)

export default function sitemap(): MetadataRoute.Sitemap {
  const homeUrls = LANGS.map((lang) => ({
    url: `${BASE_URL}/${lang}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  const staticUrls = LANGS.flatMap((lang) =>
    ['/tools'].map((path) => ({
      url: `${BASE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  )

  // ko 우선 색인 전략 (2026-07): 카테고리·서브 콘텐츠 페이지는 ko만 제출.
  // en/ja 도구 페이지는 GLOBAL_TOOLS(어학·다국어 설계 도구)만 제출 — noindex 정책과 일치.
  const categoryUrls = NONEMPTY_CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/ko/tools/${cat}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Every tool, every language. No lastModified: stamping every deploy's build time on all
  // ~360 tools made the signal meaningless (Google distrusts an always-fresh lastmod and then
  // ignores it — omitting is the documented recommendation when the real date isn't tracked).
  // changeFrequency is ignored by Google/Bing either way; weekly just reads truthfully.
  const toolUrls = TOOLS.filter((tool) => !isHiddenTool(tool)).flatMap((tool) =>
    (GLOBAL_TOOLS.has(tool.slug) ? LANGS : ['ko']).map((lang) => ({
      url: `${BASE_URL}/${lang}/tools/${tool.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  )

  // 고사성어 is Korean-only content, so only the /ko idiom pages are canonical/indexable
  // (en/ja consolidate onto /ko). Submit just the /ko URLs.
  const idiomUrls = IDIOMS.map((i) => ({
    url: `${BASE_URL}/ko/tools/gosaseongeo/${encodeURIComponent(i.reading)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 삼국지 고사성어 — ko 우선 전략: ko만 제출 (en/ja는 도구 레이아웃 noindex 상속)
  const tkIdiomUrls = TK_IDIOMS.map((i) => ({
    url: `${BASE_URL}/ko/tools/three-kingdoms-idioms/${i.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 삼국지 시리즈 개별 페이지 (인물 60 + 명언 40 + 전투 15) × 3 langs —
  // 카테고리가 숨김 해제(HIDDEN_CATEGORIES에서 제거)되는 순간 자동 포함.
  const tkOpen = !HIDDEN_CATEGORIES.has('three-kingdoms')
  const tkSeriesUrls = !tkOpen ? [] : [
    ...TK_CHARS.map((c) => ({ url: `${BASE_URL}/ko/tools/three-kingdoms-characters/${c.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...TK_QUOTES.map((q) => ({ url: `${BASE_URL}/ko/tools/three-kingdoms-quotes/${q.slug}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...TK_BATTLES.map((b) => ({ url: `${BASE_URL}/ko/tools/three-kingdoms-battles/${b.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]

  // 원소·국가·색상 개별 페이지 — ko 우선 전략: ko만 제출
  const elementUrls = ELEMENTS.map((e) => ({
    url: `${BASE_URL}/ko/tools/periodic-table/${elementSlug(e)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const countryUrls = COUNTRIES.map((c) => ({
    url: `${BASE_URL}/ko/tools/country-info/${countrySlug(c)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const colorUrls = CSS_COLORS.map((c) => ({
    url: `${BASE_URL}/ko/tools/html-color-names/${colorSlug(c)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 천자문 한자 (1000) + 사자소학 구절 (39) pages — Korean-only content, /ko URLs only
  // (other locales consolidate via canonical, same as the idiom pages).
  const hanjaUrls = HANJA_LIST.map((h) => ({
    url: `${BASE_URL}/ko/tools/cheonjamun/${encodeURIComponent(h.hanja)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))
  const sajaUrls = SAJASOHAK.map((v) => ({
    url: `${BASE_URL}/ko/tools/sajasohak/${v.no}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // 별자리·띠 개별 페이지 — ko 우선 전략: ko만 제출
  const zodiacUrls = [
    ...ZODIAC_SIGNS.map((s) => ({ url: `${BASE_URL}/ko/tools/zodiac-sign/${s.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...ZODIAC_ANIMALS.map((a) => ({ url: `${BASE_URL}/ko/tools/chinese-zodiac/${a.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]

  return [...homeUrls, ...staticUrls, ...categoryUrls, ...toolUrls, ...idiomUrls, ...tkIdiomUrls, ...tkSeriesUrls, ...elementUrls, ...countryUrls, ...colorUrls, ...hanjaUrls, ...sajaUrls, ...zodiacUrls]
}
