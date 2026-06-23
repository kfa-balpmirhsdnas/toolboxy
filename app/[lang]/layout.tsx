import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SignupGateProvider from '@/components/auth/SignupGate'

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
    '100+ free online tools for PDF, image, text and developer tasks. No installation, runs in your browser.'
  try {
    const m = (await import(`../../locales/${lang}/common.json`)).default as {
      site?: { description?: string }
    }
    if (m.site?.description) description = m.site.description
  } catch { /* keep default */ }

  const title = titles[lang] ?? titles['en']
  return {
    metadataBase: new URL('https://www.toolboxy.net'),
    title,
    description,
    openGraph: { title, description, url: `https://www.toolboxy.net/${lang}`, siteName: 'ToolBoxy', type: 'website', locale: lang },
    twitter: { card: 'summary_large_image', title, description },
  }
}

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
    messages = (await import(`../../locales/${lang}/common.json`)).default
  } catch {
    messages = {}
  }

  const siteLd = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'ToolBoxy', url: 'https://www.toolboxy.net' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ToolBoxy', url: 'https://www.toolboxy.net' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      <GoogleAnalytics />
      <NextIntlClientProvider locale={lang} messages={messages}>
        <SignupGateProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SignupGateProvider>
      </NextIntlClientProvider>
    </>
  )
}
