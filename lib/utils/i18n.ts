import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) notFound()
  return {
    locale,
    messages: (await import(`../../locales/${locale}/common.json`)).default,
  }
})
