import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  return {
    metadataBase: new URL('https://toolboxy.net'),
    alternates: {
      languages: {
        en: '/en',
        ja: '/ja',
        ko: '/ko',
      },
    },
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
  setRequestLocale(params.lang)

  const messages = await getMessages()

  return (
    <html lang={params.lang} className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
