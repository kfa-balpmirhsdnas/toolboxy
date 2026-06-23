'use client'

import Link from 'next/link'
import { CATEGORY_META, isToolNew, type ToolMeta } from '@/lib/tools/registry'
import { useSignupGate } from '@/components/auth/SignupGate'

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
  const catMeta = CATEGORY_META[tool.category] ?? { icon: '', label: '', color: 'gray' }
  const { guard } = useSignupGate()
  const href = `/${lang}/tools/${tool.slug}`

  // Guests reaching a tool via internal navigation (Home / Tools listing) hit
  // the sign-up gate; direct URL entries never go through this onClick.
  const handleClick = (e: React.MouseEvent) => {
    if (!guard(href)) e.preventDefault()
  }

  return (
    <Link href={href} onClick={handleClick} className="tool-card group block">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{catMeta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors text-sm">
              {slugToName(tool.slug)}
            </h3>
            {isToolNew(tool) && <span className="badge-new">New</span>}
            {tool.isPro && <span className="badge-pro">Pro</span>}
            {!tool.isPro && <span className="badge-free">Free</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {(tool.tags ?? []).slice(0, 3).join(' · ')}
          </p>
        </div>
      </div>
    </Link>
  )
}
