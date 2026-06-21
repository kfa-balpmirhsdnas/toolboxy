import Link from 'next/link'
import { CATEGORY_META, type ToolMeta } from '@/lib/tools/registry'
import { cn } from '@/lib/utils/cn'

interface ToolCardProps {
  tool: ToolMeta
  lang: string
}

// Human-readable names for slugs
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function ToolCard({ tool, lang }: ToolCardProps) {
  const catMeta = CATEGORY_META[tool.category]

  return (
    <Link href={`/${lang}/tools/${tool.slug}`} className="tool-card group block">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{catMeta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors text-sm">
              {slugToName(tool.slug)}
            </h3>
            {tool.isNew && <span className="badge-new">New</span>}
            {tool.isPro && <span className="badge-pro">Pro</span>}
            {!tool.isPro && <span className="badge-free">Free</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {tool.tags.slice(0, 3).join(' · ')}
          </p>
        </div>
      </div>
    </Link>
  )
}
