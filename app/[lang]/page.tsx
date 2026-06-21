import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { TOOLS, CATEGORY_META, type ToolCategory } from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'

export default function HomePage({ params }: { params: { lang: string } }) {
  const phase1Tools = TOOLS.filter((t) => t.phase === 1)
  const categories = Object.keys(CATEGORY_META) as ToolCategory[]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Free Online Tools
            <span className="block text-brand-200 text-3xl font-normal mt-2">
              for Everyone
            </span>
          </h1>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            100+ free utilities for PDF, image, video, text and more.
            No sign-up required. Works in your browser.
          </p>
          <Link
            href={`/${params.lang}/tools`}
            className="inline-block bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors text-lg"
          >
            Browse All Tools →
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
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:border-brand-400 hover:text-brand-600 transition-colors"
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Popular Tools */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular Tools</h2>
          <Link
            href={`/${params.lang}/tools`}
            className="text-brand-600 hover:text-brand-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {phase1Tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} lang={params.lang} />
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-brand-50 border-y border-brand-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '100+', label: 'Free Tools' },
            { value: '0', label: 'Installation Required' },
            { value: '3', label: 'Languages' },
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
