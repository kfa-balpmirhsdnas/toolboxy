import { getRequestConfig } from 'next-intl/server'

const SUPPORTED_LOCALES = ['en', 'ja', 'ko']

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'en'
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'en'

  let messages = {}
  try {
    messages = (await import(`../../locales/${safeLocale}/common.json`)).default
  } catch {
    messages = {}
  }

  return {
    locale: safeLocale,
    messages,
  }
})
