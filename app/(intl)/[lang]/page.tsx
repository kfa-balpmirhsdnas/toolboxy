'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations, useMessages } from 'next-intl'
import { TOOLS, CATEGORY_META, type ToolCategory, type ToolMeta } from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'

const NEW_COUNT = 12        // ✨ 신규 도구 개수
const PER_CATEGORY = 8      // 카테고리별 둘러보기 — 카테고리당 대표 도구 수

// Non-empty categories only (skip categories with no tools).
const CATEGORIES = (Object.keys(CATEGORY_META) as ToolCategory[]).filter((cat) =>
  TOOLS.some((t) => t.category === cat),
)
// Newest tools by `added` date (descending); undated tools sort last.
const NEW_TOOLS = [...TOOLS]
  .sort((a, b) => (b.added ?? '').localeCompare(a.added ?? ''))
  .slice(0, NEW_COUNT)
const TOOLS_BY_SLUG = new Map(TOOLS.map((t) => [t.slug, t]))

export default function HomePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('home')
  const tc = useTranslations('categories')
  const tg = useTranslations('gate')
  const messages = useMessages() as { toolNames?: Record<string, string>; toolTags?: Record<string, string[]> }

  const [query, setQuery] = useState('')
  const [featuredSlugs, setFeaturedSlugs] = useState<string[]>([])

  // Featured list is admin-managed (config/featuredTools) — fetched at runtime so
  // edits show up without a redeploy. Failure just leaves the section hidden.
  useEffect(() => {
    let alive = true
    fetch('/api/featured')
      .then((r) => r.json())
      .then((d) => { if (alive) setFeaturedSlugs(Array.isArray(d.slugs) ? d.slugs : []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const featured = useMemo(
    () => featuredSlugs.map((s) => TOOLS_BY_SLUG.get(s)).filter((x): x is ToolMeta => !!x),
    [featuredSlugs],
  )

  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    if (!q) return []
    return TOOLS.filter((tool) => {
      const name = (messages.toolNames?.[tool.slug] ?? '').toLowerCase()
      const tags = (messages.toolTags?.[tool.slug] ?? tool.tags ?? []).join(' ').toLowerCase()
      const slugWords = tool.slug.replace(/-/g, ' ')
      const cat = tc(tool.category).toLowerCase()
      return name.includes(q) || slugWords.includes(q) || tool.slug.includes(q) || tags.includes(q) || cat.includes(q)
    }).slice(0, 60)
  }, [q, messages, tc])

  return (
    <div>
      {/* Hero + search */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {t('hero_title')}
            <span className="block text-brand-200 text-3xl font-normal mt-2">{t('hero_subtitle')}</span>
          </h1>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">{t('hero_description')}</p>
          <div className="max-w-xl mx-auto">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              aria-label={t('search_placeholder')}
              className="w-full px-5 py-3.5 rounded-xl text-gray-800 text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-300/50 placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Category pills (quick jump) */}
      <section className="bg-gray-50 border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/${params.lang}/tools/${cat}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <span>{CATEGORY_META[cat].icon}</span>
              <span>{tc(cat)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sign-up CTA */}
      <section className="bg-brand-50 border-b border-brand-100 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-brand-800">📌 {t('save_cta')}</span>
            <span className="text-sm text-brand-600 ml-2">— {t('save_cta_sub')}</span>
          </div>
          <Link href={`/${params.lang}/signup`} className="shrink-0 bg-brand-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-brand-700 transition-colors text-sm">
            {tg('create')}
          </Link>
        </div>
      </section>

      {q ? (
        /* Search results */
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('search_results')} · {results.length}</h2>
          {results.length === 0 ? (
            <p className="text-gray-500 py-12 text-center">{t('search_no_results')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((tool) => <ToolCard key={tool.slug} tool={tool} lang={params.lang} />)}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 💼 추천 도구 (admin-managed) */}
          {featured.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 pt-12 pb-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💼 {t('featured_tools')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured.map((tool) => <ToolCard key={tool.slug} tool={tool} lang={params.lang} />)}
              </div>
            </section>
          )}

          {/* ✨ 신규 도구 (auto by added date) */}
          <section className="max-w-6xl mx-auto px-4 pt-12 pb-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✨ {t('new_tools')}</h2>
              <Link href={`/${params.lang}/tools`} className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                {t('view_all')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {NEW_TOOLS.map((tool) => <ToolCard key={tool.slug} tool={tool} lang={params.lang} />)}
            </div>
          </section>

          {/* 카테고리별 둘러보기 */}
          <section className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('browse_by_category')}</h2>
            <div className="space-y-10">
              {CATEGORIES.map((cat) => {
                const catTools = TOOLS.filter((tool) => tool.category === cat).slice(0, PER_CATEGORY)
                if (catTools.length === 0) return null
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>{CATEGORY_META[cat].icon}</span>
                        <span>{tc(cat)}</span>
                      </h3>
                      <Link href={`/${params.lang}/tools/${cat}`} className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                        {t('view_all')} →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {catTools.map((tool) => <ToolCard key={tool.slug} tool={tool} lang={params.lang} />)}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      {/* Stats banner */}
      <section className="bg-brand-50 border-y border-brand-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '300+', label: t('stats_tools') },
            { value: '0', label: t('stats_install') },
            { value: '3', label: t('stats_languages') },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-brand-700">{stat.value}</div>
              <div className="text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
