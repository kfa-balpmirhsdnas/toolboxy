import type { MetadataRoute } from 'next'
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/tools/registry'
import { IDIOMS } from '@/lib/gosaseongeo'

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

  return [...homeUrls, ...staticUrls, ...categoryUrls, ...toolUrls, ...idiomUrls]
}
