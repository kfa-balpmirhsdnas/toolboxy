import type { Metadata } from 'next'
import { TOOLS, APP_LOCALES } from './registry'

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko'] as const

/**
 * ko 우선 색인 전략 (2026-07 GSC 노출 붕괴 대응): Google이 en/ja 도구 페이지 대부분을
 * "크롤링됨-색인 안 됨"으로 거부(1,160건)하면서 사이트 전체가 저품질 분류로 억제됐다.
 * 대응: 해당 언어권에 실질 가치가 있는 도구(GLOBAL_TOOLS)만 en/ja 색인을 유지하고,
 * 나머지 en/ja 페이지는 noindex,follow + 사이트맵 제외 + hreflang 제거로 정리해
 * "색인 가치 있는 URL 비율"을 올린다. 콘텐츠 보강 후 이 Set에 추가하면 재개방된다.
 */
export const GLOBAL_TOOLS: ReadonlySet<string> = new Set([
  // 사전·어학 (언어 자체가 콘텐츠 — en/ja 사용자가 실제 대상)
  'korean-to-japanese', 'korean-to-english', 'japanese-to-korean', 'english-to-korean',
  'japanese-to-english', 'english-to-japanese', 'korean-antonyms', 'japanese-antonyms', 'english-antonyms',
  'elementary-japanese-words', 'elementary-english-words',
  // 언어별 타이틀·콘텐츠를 따로 설계한 도구
  'card-news-maker', 'taxi-fare', 'time-difference',
])
export const isIndexableLocale = (slug: string, lang: string) => lang === 'ko' || GLOBAL_TOOLS.has(slug)

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

async function loadMessages(lang: string) {
  try {
    return (await import(`../../locales/${lang}/common.json`)).default as {
      toolDescriptions?: Record<string, string | { description?: string }>
      toolNames?: Record<string, string>
      toolTitles?: Record<string, string>
    }
  } catch {
    return undefined
  }
}

function descFrom(v: string | { description?: string } | undefined): string | undefined {
  // Entries are a mix of plain strings and { title, description } objects.
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof v.description === 'string') return v.description
  return undefined
}

/**
 * Build per-tool, per-language SEO metadata: a unique title + description
 * (localized via toolDescriptions, with a localized fallback), canonical URL,
 * and hreflang alternates for en/ja/ko. Used by each tool folder's layout.tsx.
 */
// Short icon label per dictionary tool (mirrors components/DynamicManifest).
const ICON_LABEL: Record<string, string> = {
  'korean-to-japanese': '한일', 'korean-to-english': '한영', 'japanese-to-korean': '일한',
  'english-to-korean': '영한', 'japanese-to-english': '일영', 'english-to-japanese': '영일',
  'korean-antonyms': '한↔', 'japanese-antonyms': '일↔', 'english-antonyms': '영↔',
}

export async function buildToolMetadata(slug: string, lang: string): Promise<Metadata> {
  const safeLang = (LANGS as readonly string[]).includes(lang) ? lang : 'en'
  const messages = await loadMessages(safeLang)
  // Localized tool name (opt-in via the `toolNames` namespace) drives the most
  // important on-page SEO signal — the <title>. Falls back to the English name.
  const name = messages?.toolNames?.[slug] ?? slugToName(slug)
  const description = descFrom(messages?.toolDescriptions?.[slug]) ?? FALLBACK[safeLang](name)
  // Use an absolute title so the brand appears exactly once (the root template
  // only reaches the [lang] layout, not deeper tool/category segments).
  // A tool may opt into a keyword-rich SEO <title> (toolTitles) that differs from
  // its on-page display name (toolNames). When set, use it verbatim + brand and
  // skip the "– {SUFFIX}" part so the SERP title stays short.
  const seoTitle = messages?.toolTitles?.[slug]
  const title = seoTitle
    ? `${seoTitle} | ToolBoxy`
    : `${name} – ${SUFFIX[safeLang]} | ToolBoxy`
  const url = `${BASE}/${safeLang}/tools/${slug}`

  // hreflang은 색인 대상 로케일만 (noindex 페이지를 alternate로 가리키면 모순 신호)
  const global = GLOBAL_TOOLS.has(slug)
  const idxLangs = global ? LANGS : (['ko'] as const)
  const languages: Record<string, string> = {}
  for (const l of idxLangs) languages[l] = `${BASE}/${l}/tools/${slug}`
  languages['x-default'] = `${BASE}/${global ? 'en' : 'ko'}/tools/${slug}`

  // Server-render a per-tool manifest link so each tool installs as its OWN PWA.
  // (A shared SSR default would make Chrome treat every page as the same app, so
  // installing one would block installing the others.)
  // NOTE: no &icon — use the plain brand icon. A dynamic SVG-with-text icon makes
  // Android's WebAPK minting fail (it can't rasterise the text), so it falls back
  // to a Chrome shortcut and separate installs break. Distinct icons come back as
  // pre-rendered PNGs later.
  // Don't offer install where the app isn't ready in this locale (e.g. /en
  // cheonsugyeong) — omit the manifest so the browser can't install it either.
  const appLocs = APP_LOCALES[slug]
  const manifest = appLocs && !appLocs.includes(safeLang)
    ? undefined
    : `/api/manifest?start=${encodeURIComponent(`/${safeLang}/tools/${slug}`)}&name=${encodeURIComponent(name)}`

  return {
    title: { absolute: title },
    description,
    manifest,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, siteName: 'ToolBoxy', type: 'website', locale: safeLang },
    twitter: { card: 'summary', title, description },
    // ko 우선 색인 전략: 비화이트리스트 en/ja 페이지는 noindex,follow (레이아웃 메타라
    // 하위 상세 페이지들에도 상속됨)
    robots: isIndexableLocale(slug, safeLang) ? undefined : { index: false, follow: true },
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

  const count = TOOLS.filter((t) => t.category === category || (t.also as string[] | undefined)?.includes(category)).length
  const title = `${catName} ${toolsWord} | ToolBoxy`
  const description = (CAT_DESC[safeLang] ?? CAT_DESC.en)(catName, count)
  const url = `${BASE}/${safeLang}/tools/${category}`

  const languages: Record<string, string> = { ko: `${BASE}/ko/tools/${category}` }
  languages['x-default'] = `${BASE}/ko/tools/${category}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, siteName: 'ToolBoxy', type: 'website', locale: safeLang },
    // 빈 카테고리 + (ko 우선 전략) 비-ko 카테고리 페이지는 색인 제외
    robots: count === 0 || safeLang !== 'ko' ? { index: false, follow: true } : undefined,
  }
}
