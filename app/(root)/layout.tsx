import type { Metadata, Viewport } from 'next'
import '../globals.css'
import RootHtml from '@/components/layout/RootHtml'

// Root layout for non-localized routes (/, error, not-found). The localized routes
// use app/[lang]/layout.tsx as their own root layout so <html lang> can reflect the
// active locale. Two root layouts → there is intentionally no app/layout.tsx.
export const metadata: Metadata = {
  title: { template: '%s | ToolBoxy', default: 'ToolBoxy – Free Online Tools' },
  description: 'ToolBoxy: 300+ free online tools for developers, designers, and everyday users.',
  metadataBase: new URL('https://www.toolboxy.net'),
  manifest: '/api/manifest?start=/en',
  appleWebApp: { capable: true, title: 'ToolBoxy', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'ToolBoxy',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export const viewport: Viewport = { themeColor: '#0284c7' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang="en">{children}</RootHtml>
}
