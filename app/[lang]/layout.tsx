import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SignupGateProvider from '@/components/auth/SignupGate'

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
  if (!SUPPORTED_LOCALES.includes(params.lang)) notFound()
  const lang = params.lang

  let messages: Record<string, unknown> = {}
  try {
    messages = (await import(`../../locales/${lang}/common.json`)).default
  } catch {
    messages = {}
  }

  return (
    <>
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
