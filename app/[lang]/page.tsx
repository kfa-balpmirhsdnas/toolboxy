'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { TOOLS, CATEGORY_META, type ToolCategory, type ToolMeta } from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'

// Round-robin interleave by category so no category clusters at the front
// (deterministic → SSR-safe). A light client-side shuffle adds per-visit variety.
function interleaveByCategory(tools: ToolMeta[]): ToolMeta[] {
  const groups = new Map<string, ToolMeta[]>()
  for (const t of tools) { const g = groups.get(t.category) ?? []; g.push(t); groups.set(t.category, g) }
  const lists = [...groups.values()]
  const out: ToolMeta[] = []
  for (let i = 0; out.length < tools.length; i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
}
const basePopular = interleaveByCategory([
  ...TOOLS.filter(t => t.phase === 1),
  ...TOOLS.filter(t => (t.phase ?? 99) > 1),
]).slice(0, 80)

export default function HomePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('home')
  const tc = useTranslations('categories')
  const tg = useTranslations('gate')
  // SSR renders the deterministic interleaved order; after mount, shuffle for variety.
  const [popular, setPopular] = useState(basePopular)
  useEffect(() => { setPopular((p) => [...p].sort(() => Math.random() - 0.5)) }, [])
  // Only show categories that actually have tools (skip empty ones).
  const categories = (Object.keys(CATEGORY_META) as ToolCategory[]).filter((cat) =>
    TOOLS.some((t) => t.category === cat),
  )

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {t('hero_title')}
            <span className="block text-brand-200 text-3xl font-normal mt-2">
              {t('hero_subtitle')}
            </span>
          </h1>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            {t('hero_description')}
          </p>
          <Link
            href={`/${params.lang}/tools`}
            className="inline-block bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors text-lg"
          >
            {t('browse_all')} →
          </Link>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-gray-50 border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat]
            return (
              <Link
                key={cat}
                href={`/${params.lang}/tools/${cat}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
              >
                <span>{meta.icon}</span>
                <span>{tc(cat)}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Sign-up CTA Banner */}
      <section className="bg-brand-50 border-b border-brand-100 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-brand-800">📌 {t('save_cta')}</span>
            <span className="text-sm text-brand-600 ml-2">— {t('save_cta_sub')}</span>
          </div>
          <Link
            href={`/${params.lang}/signup`}
            className="shrink-0 bg-brand-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-brand-700 transition-colors text-sm"
          >
            {tg('create')}
          </Link>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('popular_tools')}</h2>
          <Link
            href={`/${params.lang}/tools`}
            className="text-brand-600 hover:text-brand-700 font-medium text-sm"
          >
            {t('view_all')} →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popular.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} lang={params.lang} />
          ))}
        </div>
      </section>

      {/* Stats Banner */}
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
