import type { Metadata, Viewport } from 'next'
import '../../globals.css'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import RootHtml from '@/components/layout/RootHtml'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SignupGateProvider from '@/components/auth/SignupGate'
import SelectSampleOnFocus from '@/components/SelectSampleOnFocus'
import ScrollInputOnFocus from '@/components/ScrollInputOnFocus'
import StandaloneRefresh from '@/components/StandaloneRefresh'

const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // Brand suffix " | ToolBoxy" is added by the root title template.
  const titles: Record<string, string> = {
    en: 'Free Online Tools for Everyone',
    ja: '誰でも使える無料オンラインツール',
    ko: '누구나 쓰는 무료 온라인 툴',
  }
  const lang = SUPPORTED_LOCALES.includes(params.lang) ? params.lang : 'en'

  let description =
    '300+ free online tools for PDF, image, text and developer tasks. No installation, runs in your browser.'
  try {
    const m = (await import(`../../../locales/${lang}/common.json`)).default as {
      site?: { description?: string }
    }
    if (m.site?.description) description = m.site.description
  } catch { /* keep default */ }

  const title = titles[lang] ?? titles['en']
  // This layout is now a root layout (renders <html>), so it carries the base
  // metadata that previously lived in app/layout.tsx: brand title template,
  // metadataBase, default manifest, app icons and OpenGraph defaults.
  return {
    metadataBase: new URL('https://www.toolboxy.net'),
    title: { default: `${title} | ToolBoxy`, template: '%s | ToolBoxy' },
    description,
    manifest: '/api/manifest?start=/en',
    appleWebApp: { capable: true, title: 'ToolBoxy', statusBarStyle: 'default' },
    icons: { icon: '/icon.svg', apple: '/icon.svg' },
    openGraph: {
      title,
      description,
      url: `https://www.toolboxy.net/${lang}`,
      siteName: 'ToolBoxy',
      type: 'website',
      locale: lang,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
    // We ship our own en/ja/ko, so tell Chrome/Google not to offer machine translation.
    // 'mobile-web-app-capable' is the standard replacement for the deprecated apple- meta
    // (appleWebApp above still emits the apple one for iOS Safari).
    other: { google: 'notranslate', 'mobile-web-app-capable': 'yes' },
  }
}

export const viewport: Viewport = { themeColor: '#0284c7' }

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  if (!SUPPORTED_LOCALES.includes(params.lang)) notFound()
  const lang = params.lang

  let messages: Record<string, unknown> = {}
  try {
    messages = (await import(`../../../locales/${lang}/common.json`)).default
  } catch {
    messages = {}
  }

  const siteLd = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'ToolBoxy', url: 'https://www.toolboxy.net' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ToolBoxy', url: 'https://www.toolboxy.net' },
  ]

  return (
    <RootHtml lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      <GoogleAnalytics />
      <NextIntlClientProvider locale={lang} messages={messages}>
        <SignupGateProvider>
          <SelectSampleOnFocus />
          <ScrollInputOnFocus />
          <StandaloneRefresh />
          <Header />
          {/* Header is position:fixed (always pinned, immune to mobile sticky quirks +
              modal scroll-lock), so reserve its height here to keep content below it. */}
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
        </SignupGateProvider>
      </NextIntlClientProvider>
    </RootHtml>
  )
}
