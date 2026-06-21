import Link from 'next/link'
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'

export default function ToolsPage({ params }: { params: { lang: string } }) {
  const categories = Object.keys(CATEGORY_META) as ToolCategory[]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Tools</h1>
      <p className="text-gray-500 mb-10">Browse our complete collection of free online utilities.</p>

      {categories.map((cat) => {
        const tools = TOOLS.filter((t) => t.category === cat)
        if (tools.length === 0) return null
        const meta = CATEGORY_META[cat]
        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{meta.icon}</span>
              <h2 className="text-xl font-bold text-gray-800">{meta.label}</h2>
              <Link
                href={`/${params.lang}/tools/${cat}`}
                className="ml-auto text-sm text-brand-600 hover:text-brand-700"
              >
                View all →
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
