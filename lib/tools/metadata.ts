import type { Metadata } from 'next'
import { TOOLS } from './registry'

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

// Localized "Free Online Tool" suffix for the <title>.
const SUFFIX: Record<string, string> = {
  en: 'Free Online Tool',
  ja: '無料オンラインツール',
  ko: '무료 온라인 도구',
}

// Localized description fallback for tools without a toolDescriptions entry.
const FALLBACK: Record<string, (name: string) => string> = {
  en: (n) => `${n} — free online tool. Fast and private, runs entirely in your browser. No sign-up, no installation.`,
  ja: (n) => `${n} — 無料のオンラインツール。ブラウザ上で高速かつ安全に動作。登録・インストール不要。`,
  ko: (n) => `${n} — 무료 온라인 도구. 브라우저에서 빠르고 안전하게 처리. 가입·설치 불필요.`,
}

// Acronyms that should render fully uppercase in tool names/titles.
const ACRONYMS = new Set([
  'pdf', 'qr', 'url', 'jwt', 'json', 'csv', 'html', 'css', 'api', 'uuid',
  'ascii', 'rgb', 'hex', 'svg', 'xml', 'yaml', 'sql', 'md5', 'sha', 'utf',
  'bmi', 'gif', 'png', 'jpg', 'ip', 'dns', 'seo', 'id', 'utm', 'qr', 'sms',
])

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

async function getDescription(slug: string, lang: string): Promise<string | undefined> {
  try {
    const messages = (await import(`../../locales/${lang}/common.json`)).default as {
      toolDescriptions?: Record<string, string | { description?: string }>
    }
    // Entries are a mix of plain strings and { title, description } objects.
    const v = messages.toolDescriptions?.[slug]
    if (typeof v === 'string') return v
    if (v && typeof v === 'object' && typeof v.description === 'string') return v.description
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Build per-tool, per-language SEO metadata: a unique title + description
 * (localized via toolDescriptions, with a localized fallback), canonical URL,
 * and hreflang alternates for en/ja/ko. Used by each tool folder's layout.tsx.
 */
export async function buildToolMetadata(slug: string, lang: string): Promise<Metadata> {
  const safeLang = (LANGS as readonly string[]).includes(lang) ? lang : 'en'
  const name = slugToName(slug)
  const description = (await getDescription(slug, safeLang)) ?? FALLBACK[safeLang](name)
  // Use an absolute title so the brand appears exactly once (the root template
  // only reaches the [lang] layout, not deeper tool/category segments).
  const title = `${name} – ${SUFFIX[safeLang]} | ToolBoxy`
  const url = `${BASE}/${safeLang}/tools/${slug}`

  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/${slug}`
  languages['x-default'] = `${BASE}/en/tools/${slug}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, siteName: 'ToolBoxy', type: 'website', locale: safeLang },
    twitter: { card: 'summary', title, description },
  }
}

const CAT_DESC: Record<string, (cat: string, n: number) => string> = {
  en: (c, n) => `${n} free online ${c} tools. Fast, private, and browser-based — no installation or sign-up.`,
  ja: (c, n) => `無料の${c}ツール${n}種。ブラウザ完結で高速・安全。インストール・登録不要。`,
  ko: (c, n) => `무료 ${c} 도구 ${n}종. 브라우저에서 빠르고 안전하게. 설치·가입 불필요.`,
}

/**
 * Metadata for a category listing page. Localized title/description from the
 * `categories`/`nav` namespaces; empty categories are noindexed (thin content).
 */
export async function buildCategoryMetadata(category: string, lang: string): Promise<Metadata> {
  const safeLang = (LANGS as readonly string[]).includes(lang) ? lang : 'en'
  let catName = category
  let toolsWord = 'Tools'
  try {
    const messages = (await import(`../../locales/${safeLang}/common.json`)).default as {
      categories?: Record<string, string>
      nav?: Record<string, string>
    }
    catName = messages.categories?.[category] ?? category
    toolsWord = messages.nav?.tools ?? 'Tools'
  } catch { /* fall back to defaults */ }

  const count = TOOLS.filter((t) => t.category === category).length
  const title = `${catName} ${toolsWord} | ToolBoxy`
  const description = (CAT_DESC[safeLang] ?? CAT_DESC.en)(catName, count)
  const url = `${BASE}/${safeLang}/tools/${category}`

  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools/${category}`
  languages['x-default'] = `${BASE}/en/tools/${category}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, siteName: 'ToolBoxy', type: 'website', locale: safeLang },
    // Empty categories have no content to rank — keep them out of the index.
    robots: count === 0 ? { index: false, follow: true } : undefined,
  }
}
