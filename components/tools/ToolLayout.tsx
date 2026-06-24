'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMessages } from 'next-intl'
import { CATEGORY_META, isToolNew, isAppTool, type ToolMeta } from '@/lib/tools/registry'
import ToolTracker from '@/components/tools/ToolTracker'
import ToolFaq from '@/components/tools/ToolFaq'
import ToolHowTo from '@/components/tools/ToolHowTo'
import UsageGate from '@/components/tools/UsageGate'
import InstallButton from '@/components/tools/InstallButton'

const LOCALES = ['en', 'ja', 'ko']
const ACRONYMS = new Set([
  'pdf', 'qr', 'url', 'jwt', 'json', 'csv', 'html', 'css', 'api', 'uuid',
  'ascii', 'rgb', 'hex', 'svg', 'xml', 'yaml', 'sql', 'md5', 'sha', 'utf',
  'bmi', 'gif', 'png', 'jpg', 'ip', 'dns', 'seo', 'id', 'utm', 'sms', 'heic', 'cps',
])

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

interface ToolLayoutProps {
  tool: ToolMeta
  lang?: string
  children: React.ReactNode
}

export default function ToolLayout({ tool, lang: langProp, children }: ToolLayoutProps) {
  // Fall back to the locale in the URL — many tool pages don't pass `lang`,
  // which otherwise made breadcrumb links point to /undefined/tools/...
  const pathname = usePathname()
  const pathLang = pathname.split('/')[1]
  const lang = langProp && langProp !== 'undefined' ? langProp : (LOCALES.includes(pathLang) ? pathLang : 'en')

  const catMeta = CATEGORY_META[tool.category]
  // Localized name (opt-in via the `toolNames` namespace), else the English name.
  const messages = useMessages() as { toolNames?: Record<string, string>; categories?: Record<string, string> }
  const name = messages?.toolNames?.[tool.slug] ?? slugToName(tool.slug)
  const catLabel = messages?.categories?.[tool.category] ?? catMeta.label

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${name} – ToolBoxy`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any (web browser)',
    url: `https://www.toolboxy.net/${lang}/tools/${tool.slug}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'ToolBoxy', url: 'https://www.toolboxy.net' },
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ToolTracker slug={tool.slug} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}/tools`} className="hover:text-brand-600 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-gray-400">{catMeta.icon}</span>
        <Link href={`/${lang}/tools/${tool.category}`} className="hover:text-brand-600 transition-colors capitalize">
          {catLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{name}</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{catMeta.icon}</span>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {isToolNew(tool) && <span className="badge-new">New</span>}
          {tool.isPro && <span className="badge-pro">Pro</span>}
          {!tool.isPro && <span className="badge-free">Free</span>}
          {isAppTool(tool) && <span className="badge-app">App</span>}
        </div>
        <p className="text-gray-500 text-sm">
          {(tool.tags ?? []).slice(0, 5).join(' · ')}
        </p>
        {/* App-install is an explicit per-tool decision: only show it once a tool
            is added to APP_TOOLS (after its feature set is settled). */}
        {isAppTool(tool) && <div className="mt-3"><InstallButton /></div>}
      </div>

      {/* Usage limit banner (logged-in users only, near/at limit) */}
      <UsageGate slug={tool.slug} lang={lang} />

      {/* Tool Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {children}
      </div>

      {/* How-to steps (by tool archetype) + HowTo JSON-LD */}
      <ToolHowTo tool={tool} />

      {/* FAQ (per-tool if available, otherwise a common free-to-use answer) */}
      <ToolFaq slug={tool.slug} />
    </div>
  )
}
