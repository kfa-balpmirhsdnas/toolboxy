import { MetadataRoute } from 'next'
import { TOOLS } from '@/lib/tools/registry'

const BASE_URL = 'https://toolboxy.net'
const LANGS = ['en', 'ja', 'ko']

export default function sitemap(): MetadataRoute.Sitemap {
  const toolUrls = LANGS.flatMap((lang) =>
    TOOLS.map((tool) => ({
      url: `${BASE_URL}/${lang}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  )

  const homeUrls = LANGS.map((lang) => ({
    url: `${BASE_URL}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  const categoryUrls = LANGS.flatMap((lang) =>
    ['pdf', 'image', 'video', 'audio', 'text', 'developer', 'file', 'utility'].map((cat) => ({
      url: `${BASE_URL}/${lang}/tools/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  return [...homeUrls, ...categoryUrls, ...toolUrls]
}
