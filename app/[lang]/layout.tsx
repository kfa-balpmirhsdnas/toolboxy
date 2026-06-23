import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })
const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    en: 'ToolBoxy – Free Online Tools for Everyone',
    ja: 'ToolBoxy – 誰でも使える無料オンラインツール',
    ko: 'ToolBoxy – 누구나 쓰는 무료 온라인 툴',
  }
  return { title: titles[params.lang] ?? titles['en'] }
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
  const lang = SUPPORTED_LOCALES.includes(params.lang) ? params.lang : 'en'
  if (!SUPPORTED_LOCALES.includes(params.lang)) notFound()

  let messages = {}
  try {
    messages = (await import(`../../locales/${lang}/common.json`)).default
  } catch {
    messages = {}
  }

  return (
    <html lang={lang} className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        <GoogleAnalytics />
        <NextIntlClientProvider locale={lang} messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
