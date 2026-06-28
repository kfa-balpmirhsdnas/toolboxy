import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'

const BASE = 'https://www.toolboxy.net'
const LANGS = ['en', 'ja', 'ko']

// Self-referencing canonical + hreflang so /en/tools /ja/tools /ko/tools aren't
// flagged as "duplicate without user-selected canonical" and are cross-linked by language.
export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = LANGS.includes(params.lang) ? params.lang : 'en'
  const titles: Record<string, string> = { en: 'All Tools', ja: 'すべてのツール', ko: '전체 도구' }
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[l] = `${BASE}/${l}/tools`
  languages['x-default'] = `${BASE}/en/tools`
  return {
    title: titles[lang] ?? titles.en, // root template appends " | ToolBoxy"
    alternates: { canonical: `${BASE}/${lang}/tools`, languages },
  }
}

export default async function ToolsPage({ params }: { params: { lang: string } }) {
  const categories = Object.keys(CATEGORY_META) as ToolCategory[]
  const tc = await getTranslations({ locale: params.lang, namespace: 'categories' })
  const th = await getTranslations({ locale: params.lang, namespace: 'home' })

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{th('all_tools')}</h1>
      <p className="text-gray-500 mb-10">{th('hero_description')}</p>

      {categories.map((cat) => {
        const tools = TOOLS.filter((t) => t.category === cat || t.also?.includes(cat))
        if (tools.length === 0) return null
        const meta = CATEGORY_META[cat]
        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{meta.icon}</span>
              <h2 className="text-xl font-bold text-gray-800">{tc(cat)}</h2>
              <Link
                href={`/${params.lang}/tools/${cat}`}
                className="ml-auto text-sm text-brand-600 hover:text-brand-700"
              >
                {th('view_all')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} lang={params.lang} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
