import type { MetadataRoute } from 'next'
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/tools/registry'
import { IDIOMS } from '@/lib/gosaseongeo'
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
  (cat) => TOOLS.some((t) => t.category === cat),
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

  const categoryUrls = LANGS.flatMap((lang) =>
    NONEMPTY_CATEGORIES.map((cat) => ({
      url: `${BASE_URL}/${lang}/tools/${cat}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  )

  // Every tool, every language. No lastModified: stamping every deploy's build time on all
  // ~360 tools made the signal meaningless (Google distrusts an always-fresh lastmod and then
  // ignores it — omitting is the documented recommendation when the real date isn't tracked).
  // changeFrequency is ignored by Google/Bing either way; weekly just reads truthfully.
  const toolUrls = LANGS.flatMap((lang) =>
    TOOLS.map((tool) => ({
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

  // Per-element pages (118 × 3 langs) — localized content, so every locale is canonical.
  const elementUrls = LANGS.flatMap((lang) =>
    ELEMENTS.map((e) => ({
      url: `${BASE_URL}/${lang}/tools/periodic-table/${elementSlug(e)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  )

  // Per-country pages (~70 × 3 langs) — localized content, every locale canonical.
  const countryUrls = LANGS.flatMap((lang) =>
    COUNTRIES.map((c) => ({
      url: `${BASE_URL}/${lang}/tools/country-info/${countrySlug(c)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  )

  // Per-CSS-color pages (140 × 3 langs).
  const colorUrls = LANGS.flatMap((lang) =>
    CSS_COLORS.map((c) => ({
      url: `${BASE_URL}/${lang}/tools/html-color-names/${colorSlug(c)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  )

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

  // Zodiac sign (12) + Chinese zodiac animal (12) pages × 3 langs — localized content.
  const zodiacUrls = LANGS.flatMap((lang) => [
    ...ZODIAC_SIGNS.map((s) => ({ url: `${BASE_URL}/${lang}/tools/zodiac-sign/${s.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...ZODIAC_ANIMALS.map((a) => ({ url: `${BASE_URL}/${lang}/tools/chinese-zodiac/${a.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ])

  return [...homeUrls, ...staticUrls, ...categoryUrls, ...toolUrls, ...idiomUrls, ...elementUrls, ...countryUrls, ...colorUrls, ...hanjaUrls, ...sajaUrls, ...zodiacUrls]
}
