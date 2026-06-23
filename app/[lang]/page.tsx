'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {TOOLS, CATEGORY_META, type ToolCategory} from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'

// Popular Tools: phase1 우선, 최대 80개
const popularTools = [
  ...TOOLS.filter(t => t.phase === 1),
  ...TOOLS.filter(t => (t.phase ?? 99) > 1)
].slice(0, 80)

export default function HomePage({ params }: { params: { lang: string } }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [pendingHref, setPendingHref] = useState('')
  const categories = Object.keys(CATEGORY_META) as ToolCategory[]

  const handleCatClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setPendingHref(href)
    setShowModal(true)
  }

  const goAnyway = () => {
    setShowModal(false)
    router.push(pendingHref)
  }

  return (
    <div>
      {/* Sign-up prompt modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Get more from ToolBoxy
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Create a free account to save your history, bookmark your favorite tools,
              and get a personal dashboard — no credit card needed.
            </p>
            <Link
              href={`/${params.lang}/auth/signup`}
              className="block w-full bg-brand-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-brand-700 transition-colors mb-3"
            >
              Create free account
            </Link>
            <Link
              href={`/${params.lang}/auth/signin`}
              className="block w-full text-center text-sm text-brand-600 hover:text-brand-700 py-1 mb-2"
            >
              Already have an account? Sign in
            </Link>
            <button
              onClick={goAnyway}
              className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Continue without signing up →
            </button>
          </div>
        </div>
      )}

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
            300+ free utilities for PDF, image, video, text and more.
            No installation required. Works in your browser.
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
            const href = `/${params.lang}/tools/${cat}`
            return (
              <a
                key={cat}
                href={href}
                onClick={handleCatClick(href)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </a>
            )
          })}
        </div>
      </section>

      {/* Sign-up CTA Banner */}
      <section className="bg-brand-50 border-b border-brand-100 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-brand-800">📌 Save your favorites & history</span>
            <span className="text-sm text-brand-600 ml-2">— Free account, no credit card required.</span>
          </div>
          <Link
            href={`/${params.lang}/auth/signup`}
            className="shrink-0 bg-brand-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-brand-700 transition-colors text-sm"
          >
            Create free account
          </Link>
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
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} lang={params.lang} />
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-brand-50 border-y border-brand-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '300+', label: 'Free Tools' },
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
