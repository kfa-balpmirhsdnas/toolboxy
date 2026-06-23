import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'


const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

const SITE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'ToolBoxy – Free Online Tools for Everyone',
    description: 'Free online tools for PDF, image, video, text, and developer tasks. No signup required. Word counter, JSON formatter, Base64 encoder, QR generator, password generator and more.',
  },
  ja: {
    title: 'ToolBoxy – 誰でも使える無料オンラインツール',
    description: 'PDF・画像・動画・テキスト・開発者向けの無料オンラインツール集。登録不要。ワードカウンター、JSONフォーマッター、QRコード生成など多数。',
  },
  ko: {
    title: 'ToolBoxy – 누구나 쓰는 무료 온라인 도구 모음',
    description: 'PDF, 이미지, 동영상, 텍스트, 개발자 도구를 무료로 사용하세요. 회원가입 불필요. 단어 세기, JSON 포매터, Base64 인코더, QR 생성기 등.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = SUPPORTED_LOCALES.includes(params.lang) ? params.lang : 'en'
  const { title, description } = SITE_META[lang] ?? SITE_META.en
  return {
    metadataBase: new URL('https://toolboxy.net'),
    title: { default: title, template: '%s | ToolBoxy' },
    description,
    keywords: ['free online tools', 'pdf tools', 'image converter', 'word counter', 'json formatter', 'base64 encoder', 'qr generator', 'password generator'],
    authors: [{ name: 'ToolBoxy' }],
    creator: 'ToolBoxy',
    openGraph: {
      title,
      description,
      url: `https://toolboxy.net/${lang}`,
      siteName: 'ToolBoxy',
      locale: lang,
      type: 'website',
      images: [{ url: 'https://toolboxy.net/og-image.png', width: 1200, height: 630, alt: 'ToolBoxy' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://toolboxy.net/og-image.png'],
    },
    alternates: {
      canonical: `https://toolboxy.net/${lang}`,
      languages: { en: '/en', ja: '/ja', ko: '/ko' },
    },
    robots: { index: true, follow: true },
    verification: { google: 'bIZMj_KMLbd3nWjDe3PtE9Os2lK9PfGqB6Ds79uuXtE' },
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

  const messages = await getMessages()

  return (
    <>

        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
          </>
  )
}
