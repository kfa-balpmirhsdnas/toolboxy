import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import {
  CATEGORY_META,
  getToolsByCategory,
  TOOLS,
  type ToolCategory,
} from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'
import { buildCategoryMetadata } from '@/lib/tools/metadata'

const CATEGORIES = Object.keys(CATEGORY_META) as ToolCategory[]

function isCategory(value: string): value is ToolCategory {
  return (CATEGORIES as string[]).includes(value)
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }))
}

export function generateMetadata({ params }: { params: { lang: string; category: string } }) {
  return buildCategoryMetadata(params.category, params.lang)
}

export default async function CategoryPage({
  params,
}: {
  params: { lang: string; category: string }
}) {
  const { lang, category } = params

  // Only real categories reach here; tool slugs match their own static
  // folders (static routes win over this dynamic segment), anything else 404s.
  if (!isCategory(category)) notFound()

  const meta = CATEGORY_META[category]
  const tools = getToolsByCategory(category)
  const t = await getTranslations({ locale: lang, namespace: 'categories' })
  const tn = await getTranslations({ locale: lang, namespace: 'nav' })

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}/tools`} className="hover:text-brand-600 transition-colors">
          {tn('tools')}<span className="text-gray-400">({TOOLS.length})</span>
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t(category)}<span className="text-gray-400 font-normal">({tools.length})</span></span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{meta.icon}</span>
        <h1 className="text-3xl font-bold text-gray-900">{t(category)}</h1>
        <span className="text-sm text-gray-400">({tools.length})</span>
      </div>

      {tools.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <div className="text-4xl mb-3">🚧</div>
          <Link href={`/${lang}/tools`} className="text-brand-600 hover:text-brand-700 font-medium">
            {tn('tools')} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}
