import Link from 'next/link'
import { CATEGORY_META, type ToolMeta } from '@/lib/tools/registry'

function slugToName(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

interface ToolLayoutProps {
  tool: ToolMeta
  lang: string
  children: React.ReactNode
}

export default function ToolLayout({ tool, lang, children }: ToolLayoutProps) {
  const catMeta = CATEGORY_META[tool.category]
  const name = slugToName(tool.slug)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}/tools`} className="hover:text-brand-600 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-gray-400">{catMeta.icon}</span>
        <Link href={`/${lang}/tools/${tool.category}`} className="hover:text-brand-600 transition-colors capitalize">
          {catMeta.label}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{catMeta.icon}</span>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {tool.isPro && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
          )}
          {tool.isNew && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
          )}
        </div>
        <p className="text-gray-500 text-sm">
          {tool.tags.slice(0, 5).join(' · ')}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}